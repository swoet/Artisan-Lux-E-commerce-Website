"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  senderId: number | null;
  senderType: string | null;
  message: string;
  createdAt: Date;
}

interface CustomOrderMessagesProps {
  orderId: number;
  messages: Message[];
  artisanId: number;
}

export default function CustomOrderMessages({ orderId, messages, artisanId }: CustomOrderMessagesProps) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/custom-orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setNewMessage("");
      router.refresh();
    } catch (error) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-serif font-bold mb-4">Messages</h2>

      {/* Messages List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isArtisan = msg.senderType === "artisan";
            return (
              <div
                key={msg.id}
                className={`flex ${isArtisan ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  isArtisan
                    ? "bg-brand-dark-wood text-white"
                    : "bg-[var(--color-card)] text-neutral-200"
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <div className={`text-xs mt-1 ${
                    isArtisan ? "text-white/70" : "text-neutral-400"
                  }`}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1"
          disabled={sending}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
