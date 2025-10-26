"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  senderId: number | null;
  senderType: string | null;
  message: string;
  createdAt: Date;
}

interface ConciergeChatProps {
  customerId: number;
  conversationId?: number;
  initialMessages: Message[];
}

export default function ConciergeChat({ customerId, conversationId, initialMessages }: ConciergeChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeConversationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/concierge/messages?conversationId=${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/concierge/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          customerId,
          message: newMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // If this is the first message, set the conversation ID
      if (!activeConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId);
      }

      // Add message to local state
      setMessages([...messages, data.message]);
      setNewMessage("");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-serif font-bold">Your Concierge</h2>
          <p className="text-sm text-neutral-600">
            {messages.length === 0 ? "Start a conversation" : `${messages.length} messages`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-neutral-600">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="mb-6 max-h-[500px] overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-4xl mb-3">👋</div>
            <p>Welcome! How can we assist you today?</p>
            <p className="text-sm mt-2">
              Ask about products, styling advice, or special requests
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isCustomer = msg.senderType === "customer";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-4 ${
                    isCustomer
                      ? "bg-brand-dark-wood text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}>
                    {!isCustomer && (
                      <div className="text-xs font-medium mb-1 opacity-75">
                        Concierge Team
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{msg.message}</p>
                    <div className={`text-xs mt-2 ${
                      isCustomer ? "text-white/70" : "text-neutral-500"
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="input flex-1 resize-none"
          rows={2}
          disabled={sending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        <button
          type="submit"
          className="btn btn-primary self-end"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      <p className="text-xs text-neutral-500 mt-3 text-center">
        Our concierge team typically responds within 1-2 hours during business hours
      </p>
    </div>
  );
}
