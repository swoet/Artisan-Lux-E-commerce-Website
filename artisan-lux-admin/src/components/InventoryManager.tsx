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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Low Stock Alerts ({lowStockItems.length})
          </h3>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{item.productTitle}</span>
                <span className="text-yellow-700">
                  {item.quantityInStock} in stock (threshold: {item.lowStockThreshold})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Inventory Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-serif text-xl font-semibold mb-4">
          Update Inventory
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product</label>
            <select
              value={selectedProduct || ""}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
            >
              <option value="">Select a product</option>
              {inventory.map((item) => (
                <option key={item.productId} value={item.productId}>
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
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
              placeholder="+10 or -5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
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
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
              placeholder="Optional notes"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateInventory}
          className="mt-4 bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800"
        >
          Update Inventory
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">
                Product
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-neutral-700">
                In Stock
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-neutral-700">
                Low Stock Threshold
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-neutral-700">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">
                Last Restocked
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">{item.productTitle}</td>
                <td className="px-6 py-4 text-center font-medium">
                  {item.quantityInStock}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.lowStockThreshold}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.isLowStock ? (
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      Low Stock
                    </span>
                  ) : item.quantityInStock === 0 ? (
                    <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      In Stock
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
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
