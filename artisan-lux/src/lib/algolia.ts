// @ts-expect-error - algoliasearch has export issues in newer versions
import algoliasearch from "algoliasearch";

// Initialize Algolia client
export const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
);

export const productsIndex = algoliaClient.initIndex("products");

// Admin client for indexing
export const algoliaAdminClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.ALGOLIA_ADMIN_KEY || ""
);

// Product type for Algolia
export type AlgoliaProduct = {
  objectID: string;
  id: number;
  title: string;
  slug: string;
  descriptionRich?: string;
  priceDecimal: number;
  currency: string;
  categoryName?: string;
  categorySlug?: string;
  materials?: string[];
  tags?: string[];
  isFeatured: boolean;
  coverImageUrl?: string;
  status: string;
  createdAt: number;
};

// Sync product to Algolia
export async function syncProductToAlgolia(product: AlgoliaProduct) {
  try {
    const adminIndex = algoliaAdminClient.initIndex("products");
    await adminIndex.saveObject(product);
    return { success: true };
  } catch (error) {
    console.error("Algolia sync error:", error);
    return { success: false, error };
  }
}

// Delete product from Algolia
export async function deleteProductFromAlgolia(productId: string) {
  try {
    const adminIndex = algoliaAdminClient.initIndex("products");
    await adminIndex.deleteObject(productId);
    return { success: true };
  } catch (error) {
    console.error("Algolia delete error:", error);
    return { success: false, error };
  }
}

// Batch sync products
export async function batchSyncProductsToAlgolia(products: AlgoliaProduct[]) {
  try {
    const adminIndex = algoliaAdminClient.initIndex("products");
    await adminIndex.saveObjects(products);
    return { success: true };
  } catch (error) {
    console.error("Algolia batch sync error:", error);
    return { success: false, error };
  }
}
