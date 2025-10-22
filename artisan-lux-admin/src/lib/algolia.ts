import { algoliasearch } from "algoliasearch";

const PRODUCTS_INDEX = "products";

// Get Algolia client
function getClient() {
  return algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
    process.env.ALGOLIA_ADMIN_API_KEY || ""
  );
}

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

/**
 * Batch sync products to Algolia
 * Replaces all objects in the index with the provided products
 */
export async function batchSyncProductsToAlgolia(products: AlgoliaProduct[]) {
  try {
    if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
      console.warn("Algolia credentials not configured, skipping sync");
      return { success: true, count: 0, skipped: true };
    }

    const client = getClient();

    // Configure index settings for better search
    await client.setSettings({
      indexName: PRODUCTS_INDEX,
      indexSettings: {
        searchableAttributes: [
          "title",
          "descriptionRich",
          "categoryName",
          "materials",
          "tags",
        ],
        attributesForFaceting: [
          "filterOnly(status)",
          "categoryName",
          "categorySlug",
          "materials",
          "tags",
          "isFeatured",
        ],
        customRanking: ["desc(isFeatured)", "desc(createdAt)"],
      },
    });

    // Save all objects to the index
    await client.saveObjects({
      indexName: PRODUCTS_INDEX,
      objects: products,
    });

    console.log(`Successfully synced ${products.length} products to Algolia`);

    return {
      success: true,
      count: products.length,
    };
  } catch (error) {
    console.error("Algolia sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Add or update a single product in Algolia
 */
export async function syncProductToAlgolia(product: AlgoliaProduct) {
  try {
    if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
      return { success: true, skipped: true };
    }

    const client = getClient();
    await client.saveObjects({
      indexName: PRODUCTS_INDEX,
      objects: [product],
    });

    return { success: true };
  } catch (error) {
    console.error("Algolia sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a product from Algolia
 */
export async function deleteProductFromAlgolia(productId: string) {
  try {
    if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
      return { success: true, skipped: true };
    }

    const client = getClient();
    await client.deleteObjects({
      indexName: PRODUCTS_INDEX,
      objectIDs: [productId],
    });

    return { success: true };
  } catch (error) {
    console.error("Algolia delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clear all products from Algolia index
 */
export async function clearAlgoliaIndex() {
  try {
    if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
      return { success: true, skipped: true };
    }

    const client = getClient();
    await client.clearObjects({
      indexName: PRODUCTS_INDEX,
    });

    return { success: true };
  } catch (error) {
    console.error("Algolia clear error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
