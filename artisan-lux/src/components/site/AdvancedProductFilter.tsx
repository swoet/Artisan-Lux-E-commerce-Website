"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback } from "react";

type FilterOptions = {
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  categories?: string[];
  featured?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
};

type AdvancedProductFilterProps = {
  availableMaterials: string[];
  availableCategories: Array<{ id: number; name: string; slug: string }>;
  priceRange: { min: number; max: number };
};

export function AdvancedProductFilter({
  availableMaterials,
  availableCategories,
  priceRange,
}: AdvancedProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: Number(searchParams.get("minPrice")) || priceRange.min,
    maxPrice: Number(searchParams.get("maxPrice")) || priceRange.max,
    materials: searchParams.get("materials")?.split(",").filter(Boolean) || [],
    categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
    featured: searchParams.get("featured") === "true",
    sortBy: (searchParams.get("sortBy") as FilterOptions["sortBy"]) || "newest",
  });

  const updateURL = useCallback(
    (newFilters: FilterOptions) => {
      const params = new URLSearchParams();

      if (newFilters.minPrice && newFilters.minPrice > priceRange.min) {
        params.set("minPrice", newFilters.minPrice.toString());
      }
      if (newFilters.maxPrice && newFilters.maxPrice < priceRange.max) {
        params.set("maxPrice", newFilters.maxPrice.toString());
      }
      if (newFilters.materials && newFilters.materials.length > 0) {
        params.set("materials", newFilters.materials.join(","));
      }
      if (newFilters.categories && newFilters.categories.length > 0) {
        params.set("categories", newFilters.categories.join(","));
      }
      if (newFilters.featured) {
        params.set("featured", "true");
      }
      if (newFilters.sortBy && newFilters.sortBy !== "newest") {
        params.set("sortBy", newFilters.sortBy);
      }

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
    },
    [router, pathname, priceRange]
  );

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | boolean | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const toggleMaterial = (material: string) => {
    const currentMaterials = filters.materials || [];
    const newMaterials = currentMaterials.includes(material)
      ? currentMaterials.filter((m) => m !== material)
      : [...currentMaterials, material];
    handleFilterChange("materials", newMaterials);
  };

  const toggleCategory = (categorySlug: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categorySlug)
      ? currentCategories.filter((c) => c !== categorySlug)
      : [...currentCategories, categorySlug];
    handleFilterChange("categories", newCategories);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      materials: [],
      categories: [],
      featured: false,
      sortBy: "newest",
    };
    setFilters(defaultFilters);
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Clear all
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          className="w-full border border-neutral-300 rounded-md px-3 py-2"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Price Range
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                handleFilterChange("minPrice", Number(e.target.value))
              }
              min={priceRange.min}
              max={filters.maxPrice}
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
              placeholder="Min"
            />
            <span className="text-neutral-500">to</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                handleFilterChange("maxPrice", Number(e.target.value))
              }
              min={filters.minPrice}
              max={priceRange.max}
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
              placeholder="Max"
            />
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={filters.maxPrice}
            onChange={(e) =>
              handleFilterChange("maxPrice", Number(e.target.value))
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Categories
          </label>
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <label key={category.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {availableMaterials.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Materials
          </label>
          <div className="space-y-2">
            {availableMaterials.map((material) => (
              <label key={material} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.materials?.includes(material)}
                  onChange={() => toggleMaterial(material)}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-700">{material}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Featured Only */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.featured}
            onChange={(e) => handleFilterChange("featured", e.target.checked)}
            className="rounded border-neutral-300"
          />
          <span className="text-sm font-medium text-neutral-700">
            Featured Items Only
          </span>
        </label>
      </div>
    </div>
  );
}
