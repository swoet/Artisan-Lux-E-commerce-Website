"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  productId: number;
  quantity: number;
  unitPrice: string;
  title: string | null;
  slug: string | null;
};

type Order = {
  id: number;
  email: string;
  total: string;
  currency: string;
  status: string;
  createdAt: Date;
  items: OrderItem[];
};

type OrderNotification = {
  id: number;
  order: Order;
  timestamp: number;
  read: boolean;
};

export default function OrderNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/socket");

    eventSource.onopen = () => {
      setConnected(true);
      console.log("SSE connected");
    };

    eventSource.onerror = () => {
      setConnected(false);
      console.error("SSE connection error");
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === "order.completed") {
          const order = payload.data as Order;
          const notif: OrderNotification = {
            id: Date.now(),
            order,
            timestamp: payload.timestamp,
            read: false,
          };

          setNotifications((prev) => [notif, ...prev].slice(0, 50));
          setLatestOrder(order);
          setShowToast(true);

          // Play notification sound
          if (typeof Audio !== "undefined") {
            try {
              const audio = new Audio("/notification.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }

          setTimeout(() => setShowToast(false), 5000);
        }
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Connection Status */}
      <div className="mb-2 flex items-center gap-2 text-xs">
        <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-gray-300">{connected ? "Live" : "Disconnected"}</span>
      </div>

      {/* Toast Notification */}
      {showToast && latestOrder && (
        <div className="mb-4 bg-gradient-to-r from-green-600 to-green-700 border border-green-500 rounded-lg shadow-2xl p-4 max-w-sm animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-2xl">🛒</div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm mb-1">New Order!</h3>
              <p className="text-green-100 text-xs mb-2">{latestOrder.email}</p>
              <div className="text-white font-bold text-sm">
                {Number(latestOrder.total).toFixed(2)} {latestOrder.currency}
              </div>
              <div className="text-green-200 text-xs mt-1">
                {latestOrder.items.length} item(s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Badge */}
      {unreadCount > 0 && (
        <div className="bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
          {unreadCount}
        </div>
      )}

      {/* Notification List */}
      {notifications.length > 0 && (
        <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-md max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-white font-semibold text-sm">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 hover:bg-gray-800 transition-colors ${!notif.read ? "bg-gray-800/50" : ""}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="flex items-start gap-2">
                  {!notif.read && (
                    <div className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      Order #{notif.order.id}
                    </div>
                    <div className="text-gray-400 text-xs truncate">{notif.order.email}</div>
                    <div className="text-green-400 text-sm font-semibold mt-1">
                      {Number(notif.order.total).toFixed(2)} {notif.order.currency}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
