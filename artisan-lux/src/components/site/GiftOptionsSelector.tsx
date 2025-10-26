"use client";

import { useState } from "react";

interface GiftOption {
  id: number;
  name: string;
  description: string | null;
  price: string;
}

interface GiftOptionsSelectorProps {
  options: GiftOption[];
  onSelect: (selectedIds: number[]) => void;
}

export default function GiftOptionsSelector({ options, onSelect }: GiftOptionsSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [giftMessage, setGiftMessage] = useState("");

  const toggleOption = (optionId: number) => {
    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];
    
    setSelectedOptions(newSelected);
    onSelect(newSelected);
  };

  const totalPrice = selectedOptions.reduce((sum, id) => {
    const option = options.find(o => o.id === id);
    return sum + (option ? parseFloat(option.price) : 0);
  }, 0);

  return (
    <div className="card">
      <h3 className="text-xl font-serif font-bold mb-4">🎁 Gift Options</h3>
      
      <div className="space-y-3 mb-6">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-brand-dark-wood bg-amber-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                    <span className="font-bold">{option.name}</span>
                  </div>
                  {option.description && (
                    <p className="text-sm text-neutral-600 ml-6">{option.description}</p>
                  )}
                </div>
                <div className="font-bold text-brand-dark-wood ml-4">
                  +${parseFloat(option.price).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gift Message */}
      {selectedOptions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Gift Message (Optional)
          </label>
          <textarea
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            rows={3}
            className="input"
            placeholder="Write a personal message for the recipient..."
            maxLength={250}
          />
          <div className="text-xs text-neutral-500 mt-1 text-right">
            {giftMessage.length}/250 characters
          </div>
        </div>
      )}

      {/* Total */}
      {totalPrice > 0 && (
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
          <span className="font-medium">Gift Services Total:</span>
          <span className="text-xl font-bold text-brand-dark-wood">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
