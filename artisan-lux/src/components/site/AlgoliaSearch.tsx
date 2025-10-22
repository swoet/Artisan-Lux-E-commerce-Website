"use client";

import { useState } from "react";
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Configure,
  Pagination,
} from "react-instantsearch";
import { algoliaClient } from "@/lib/algolia";
import Link from "next/link";

type Hit = {
  objectID: string;
  title: string;
  slug: string;
  priceDecimal: number;
  currency: string;
  coverImageUrl?: string;
  categoryName?: string;
  materials?: string[];
};

function ProductHit({ hit }: { hit: Hit }) {
  return (
    <Link
      href={`/product/${hit.slug}`}
      className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-neutral-100 overflow-hidden">
        {hit.coverImageUrl ? (
          <img
            src={hit.coverImageUrl}
            alt={hit.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
          {hit.title}
        </h3>
        {hit.categoryName && (
          <p className="text-sm text-neutral-500 mb-2">{hit.categoryName}</p>
        )}
        <p className="font-medium text-neutral-900">
          {hit.currency} {hit.priceDecimal.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

export function AlgoliaSearch() {
  return (
    <div className="container mx-auto px-4 py-8">
      <InstantSearch
        searchClient={algoliaClient}
        indexName="products"
        routing={true}
      >
        <Configure hitsPerPage={20} filters="status:published" />

        <div className="mb-8">
          <SearchBox
            placeholder="Search for luxury products..."
            classNames={{
              root: "max-w-2xl mx-auto",
              form: "relative",
              input:
                "w-full px-6 py-4 text-lg border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none",
              submit: "absolute right-4 top-1/2 -translate-y-1/2",
              reset: "absolute right-16 top-1/2 -translate-y-1/2",
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4">
                  Categories
                </h3>
                <RefinementList
                  attribute="categoryName"
                  classNames={{
                    list: "space-y-2",
                    item: "flex items-center gap-2",
                    label: "flex items-center gap-2 cursor-pointer",
                    checkbox: "rounded",
                    count:
                      "ml-auto text-sm text-neutral-500 bg-neutral-100 px-2 py-1 rounded",
                  }}
                />
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold mb-4">
                  Materials
                </h3>
                <RefinementList
                  attribute="materials"
                  classNames={{
                    list: "space-y-2",
                    item: "flex items-center gap-2",
                    label: "flex items-center gap-2 cursor-pointer",
                    checkbox: "rounded",
                    count:
                      "ml-auto text-sm text-neutral-500 bg-neutral-100 px-2 py-1 rounded",
                  }}
                />
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold mb-4">
                  Featured
                </h3>
                <RefinementList
                  attribute="isFeatured"
                  transformItems={(items) =>
                    items.map((item) => ({
                      ...item,
                      label: item.label === "true" ? "Featured" : "Regular",
                    }))
                  }
                  classNames={{
                    list: "space-y-2",
                    item: "flex items-center gap-2",
                    label: "flex items-center gap-2 cursor-pointer",
                    checkbox: "rounded",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <Hits
              hitComponent={ProductHit}
              classNames={{
                root: "space-y-6",
                list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                item: "",
              }}
            />

            <div className="mt-8 flex justify-center">
              <Pagination
                classNames={{
                  root: "flex gap-2",
                  list: "flex gap-2",
                  item: "rounded-md",
                  link: "px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-100",
                  selectedItem: "bg-neutral-900 text-white",
                }}
              />
            </div>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}
