import { InventoryManager } from "@/components/InventoryManager";

export const metadata = {
  title: "Inventory Management | Artisan Lux Admin",
  description: "Manage product inventory and stock levels",
};

export default function InventoryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">
        Inventory Management
      </h1>
      <InventoryManager />
    </div>
  );
}
