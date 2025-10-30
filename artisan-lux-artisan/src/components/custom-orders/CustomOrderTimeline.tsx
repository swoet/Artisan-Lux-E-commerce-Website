interface CustomOrder {
  id: number;
  status: string | null;
  createdAt: Date;
  quotedAt?: Date | null;
  acceptedAt?: Date | null;
  productionStartedAt?: Date | null;
  completedAt?: Date | null;
  deliveredAt?: Date | null;
}

interface CustomOrderTimelineProps {
  order: CustomOrder;
}

export default function CustomOrderTimeline({ order }: CustomOrderTimelineProps) {
  const stages = [
    { key: "created", label: "Request Received", date: order.createdAt, icon: "📝" },
    { key: "quoted", label: "Quote Sent", date: order.quotedAt, icon: "💰" },
    { key: "accepted", label: "Quote Accepted", date: order.acceptedAt, icon: "✓" },
    { key: "production", label: "Production Started", date: order.productionStartedAt, icon: "🔨" },
    { key: "completed", label: "Completed", date: order.completedAt, icon: "✨" },
    { key: "delivered", label: "Delivered", date: order.deliveredAt, icon: "📦" },
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-serif font-bold mb-6">Production Timeline</h2>
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isCompleted = stage.date !== null && stage.date !== undefined;
          const isCurrent = !isCompleted && index > 0 && stages[index - 1].date;

          return (
            <div key={stage.key} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCompleted ? "bg-green-900/30 text-green-300" :
                isCurrent ? "bg-blue-900/30 text-blue-300" :
                "bg-neutral-800 text-neutral-400"
              }`}>
                {stage.icon}
              </div>
              <div className="flex-1 pb-4">
                <div className={`font-medium ${
                  isCompleted ? "text-green-300" :
                  isCurrent ? "text-blue-300" :
                  "text-neutral-400"
                }`}>
                  {stage.label}
                </div>
                {stage.date && (
                  <div className="text-sm text-neutral-400">
                    {new Date(stage.date).toLocaleDateString()} at {new Date(stage.date).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
