"use client";

import { useState, useEffect } from "react";

type InventoryItem = {
  id: number;
  productId: number;
  productTitle: string;
  productSlug: string;
  quantityInStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lastRestockedAt: string | null;
  updatedAt: string;
};

export function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [reason, setReason] = useState<string>("restock");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error("Fetch inventory error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async () => {
    if (!selectedProduct || quantityChange === 0) {
      alert("Please select a product and enter a quantity change");
      return;
    }

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          quantityChange,
          reason,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Inventory updated successfully");
        setQuantityChange(0);
        setNotes("");
        fetchInventory();
      } else {
        alert("Failed to update inventory");
      }
    } catch (error) {
      console.error("Update inventory error:", error);
      alert("Error updating inventory");
    }
  };

  const lowStockItems = inventory.filter((item) => item.isLowStock);

  if (loading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold mb-2 text-[var(--color-fg)]">
            ⚠️ Low Stock Alerts ({lowStockItems.length})
          </h3>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{item.productTitle}</span>
                <span className="text-[var(--color-muted)]">
                  {item.quantityInStock} in stock (threshold: {item.lowStockThreshold})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Inventory Form */}
      <div className="card p-6">
        <h3 className="font-serif text-xl font-semibold mb-4">
          Update Inventory
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product</label>
            <select
              value={selectedProduct || ""}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              className="select"
            >
              <option value="">Select a product</option>
              {inventory.map((item) => (
                <option key={item.productId} value={item.productId} className="bg-[var(--color-card)] text-[var(--color-fg)]">
                  {item.productTitle} ({item.quantityInStock} in stock)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Quantity Change
            </label>
            <input
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(Number(e.target.value))}
              className="input"
              placeholder="+10 or -5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="select"
            >
              <option value="restock">Restock</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
              <option value="damaged">Damaged</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              placeholder="Optional notes"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateInventory}
          className="btn mt-4"
        >
          Update Inventory
        </button>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium">
                Product
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium">
                In Stock
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium">
                Low Stock Threshold
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium">
                Last Restocked
              </th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--color-fg)]/5">
                <td className="px-6 py-4">{item.productTitle}</td>
                <td className="px-6 py-4 text-center font-medium">
                  {item.quantityInStock}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.lowStockThreshold}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.isLowStock ? (
                    <span className="badge badge-warning">Low Stock</span>
                  ) : item.quantityInStock === 0 ? (
                    <span className="badge badge-error">Out of Stock</span>
                  ) : (
                    <span className="badge badge-success">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-muted)]">
                  {item.lastRestockedAt
                    ? new Date(item.lastRestockedAt).toLocaleDateString()
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
