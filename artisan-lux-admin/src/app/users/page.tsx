import { listCustomers, recentAuthEvents } from "@/db/queries/customers";

async function getData() {
  const customers = await listCustomers({ limit: 50, offset: 0 });
  const events = await recentAuthEvents(50);
  return { customers, events } as const;
}

export default async function UsersPage() {
  const data = await getData();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Users</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-2">Registered Users ({data.customers.total})</h2>
          <ul className="divide-y divide-[var(--color-border)]">
            {data.customers.items.map((u: any) => (
              <li key={u.id} className="py-2 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.email}</div>
                  {u.name ? <div className="text-neutral-400">{u.name}</div> : null}
                </div>
                <div className="text-neutral-400">{new Date(u.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-2">Recent Auth Events</h2>
          <ul className="divide-y divide-[var(--color-border)]">
            {data.events.map((e: any) => (
              <li key={e.id} className="py-2 text-sm flex items-center justify-between">
                <div className="capitalize">{e.type}</div>
                <div className="text-neutral-400">{new Date(e.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
