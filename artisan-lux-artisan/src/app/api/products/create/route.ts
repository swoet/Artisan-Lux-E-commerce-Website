import { NextRequest, NextResponse } from "next/server";
import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { products, productArtisans, provenancePassports, inventory, mediaAssets, productGallery } from "@/db/schema";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateSerialNumber(): string {
  const prefix = "AL";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const artisan = await requireArtisanAuth();
    const data = await request.json();

    const {
      title,
      description,
      price,
      categoryId,
      stock,
      images,
      status,
      passport,
    } = data;

    // Validate required fields
    if (!title || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(title);

    // Handle cover image
    let coverImageId = null;
    if (images && images.length > 0) {
      const [coverMedia] = await db
        .insert(mediaAssets)
        .values({
          url: images[0],
          type: "image",
          createdAt: new Date(),
        })
        .returning();
      coverImageId = coverMedia.id;
    }

    // Create product with correct schema
    const [newProduct] = await db
      .insert(products)
      .values({
        title,
        slug,
        descriptionRich: description,
        priceDecimal: price.toString(),
        categoryId,
        coverImageId,
        status: status === "active" ? "published" : "draft",
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create inventory record
    if (stock !== undefined) {
      await db.insert(inventory).values({
        productId: newProduct.id,
        quantityInStock: stock,
        lowStockThreshold: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create gallery images
    if (images && images.length > 1) {
      for (let i = 1; i < images.length; i++) {
        const [media] = await db
          .insert(mediaAssets)
          .values({
            url: images[i],
            type: "image",
            createdAt: new Date(),
          })
          .returning();

        await db.insert(productGallery).values({
          productId: newProduct.id,
          mediaId: media.id,
          sortOrder: i,
          createdAt: new Date(),
        });
      }
    }

    // Link product to artisan
    await db.insert(productArtisans).values({
      productId: newProduct.id,
      artisanId: artisan.id,
      role: "creator",
      commissionRate: 70, // Default 70% commission for artisan
      createdAt: new Date(),
    });

    // Create provenance passport if requested
    if (passport) {
      const serialNumber = generateSerialNumber();

      await db.insert(provenancePassports).values({
        productId: newProduct.id,
        serialNumber,
        materialsOrigin: passport.materialsOrigin || null,
        productionTimeHours: passport.productionTime || null,
        artisanNotes: passport.artisanNotes || null,
        careInstructions: passport.careInstructions || null,
        carbonFootprint: passport.carbonFootprint ? passport.carbonFootprint.toString() : null,
        sustainabilityCertifications: passport.certifications || [],
        warrantyYears: passport.warrantyYears || 1,
        resaleEligible: passport.resaleEligible ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Trigger revalidation on customer site
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: ["products", `category-${categoryId}`, `product-${newProduct.id}`],
        }),
      });
    } catch (revalidateError) {
      console.error("Revalidation error:", revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
