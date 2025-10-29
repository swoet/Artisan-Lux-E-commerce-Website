import { db } from "@/db";
import { conciergeConversations, conciergeMessages, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ConciergeChat from "@/components/site/ConciergeChat";

export const metadata = {
  title: "Concierge Service | Artisan Lux",
  description: "Personal shopping assistance and styling consultation",
};

// This would normally get the customer from session
// For now, we'll use a placeholder
type CurrentCustomer = { id: number };
async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  // TODO: Implement proper session-based customer retrieval
  return null;
}

export default async function ConciergePage() {
  const customer = await getCurrentCustomer();

  let conversation = null;
  let messages: any[] = [];

  if (customer) {
    // Get or create conversation for customer
    const [existingConversation] = await db
      .select()
      .from(conciergeConversations)
      .where(eq(conciergeConversations.customerId, customer.id))
      .orderBy(desc(conciergeConversations.createdAt))
      .limit(1);

    if (existingConversation) {
      conversation = existingConversation;
      
      // Get messages
      messages = await db
        .select()
        .from(conciergeMessages)
        .where(eq(conciergeMessages.conversationId, conversation.id))
        .orderBy(conciergeMessages.createdAt);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Concierge Service
          </h1>
          <p className="text-xl opacity-90">
            Personal shopping assistance and expert styling consultation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Service Info */}
        <div className="card mb-8">
          <h2 className="text-2xl font-serif font-bold mb-4">How Our Concierge Service Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-bold mb-2">Chat with Experts</h3>
              <p className="text-sm text-neutral-600">
                Connect with our luxury shopping specialists
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-bold mb-2">Get Personalized Advice</h3>
              <p className="text-sm text-neutral-600">
                Receive curated recommendations and styling boards
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-bold mb-2">Exclusive Access</h3>
              <p className="text-sm text-neutral-600">
                First look at new arrivals and limited editions
              </p>
            </div>
          </div>
        </div>

        {/* VIP Badge */}
        <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">👑</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">VIP Exclusive Service</h3>
              <p className="text-sm text-neutral-700">
                Concierge service is available to our VIP members. 
                {!customer && " Sign in or upgrade to VIP to start chatting."}
              </p>
            </div>
            {!customer && (
              <a href="/account/vip" className="btn btn-primary">
                Become VIP
              </a>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        {customer ? (
          <ConciergeChat 
            customerId={customer.id}
            conversationId={conversation?.id}
            initialMessages={messages}
          />
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-serif font-bold mb-2">Sign In Required</h3>
            <p className="text-neutral-600 mb-6">
              Please sign in to access concierge service
            </p>
            <a href="/login" className="btn btn-primary">
              Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
