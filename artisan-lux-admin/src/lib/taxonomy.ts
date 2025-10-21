export type TaxonomyNode = {
  key: string;
  name: string;
  children?: TaxonomyNode[];
};

export const TAXONOMY: TaxonomyNode[] = [
  {
    key: "fashion",
    name: "Fashion",
    children: [
      { key: "fashion_men_clothing", name: "Men's Clothing" },
      { key: "fashion_men_shoes", name: "Men's Shoes" },
      { key: "fashion_women_clothing", name: "Women's Clothing" },
      { key: "fashion_women_shoes", name: "Women's Shoes" },
      { key: "fashion_accessories", name: "Accessories" },
      { key: "fashion_bags", name: "Bags" },
      { key: "fashion_jewelry", name: "Jewelry" },
      { key: "fashion_watches", name: "Watches" },
    ],
  },
  {
    key: "home_living",
    name: "Home & Living",
    children: [
      { key: "home_furniture", name: "Furniture" },
      { key: "home_lighting", name: "Lighting" },
      { key: "home_decor", name: "Decor" },
      { key: "home_kitchen_dining", name: "Kitchen & Dining" },
      { key: "home_bed_bath", name: "Bed & Bath" },
      { key: "home_textiles", name: "Textiles" },
    ],
  },
  {
    key: "art_collectibles",
    name: "Art & Collectibles",
    children: [
      { key: "art_paintings", name: "Paintings" },
      { key: "art_sculpture", name: "Sculpture" },
      { key: "art_prints", name: "Prints" },
      { key: "art_photography", name: "Photography" },
    ],
  },
  {
    key: "beauty_grooming",
    name: "Beauty & Grooming",
    children: [
      { key: "beauty_skincare", name: "Skincare" },
      { key: "beauty_fragrance", name: "Fragrance" },
      { key: "beauty_haircare", name: "Haircare" },
      { key: "beauty_makeup", name: "Makeup" },
    ],
  },
  {
    key: "electronics",
    name: "Electronics",
    children: [
      { key: "electronics_audio", name: "Audio" },
      { key: "electronics_cameras", name: "Cameras" },
      { key: "electronics_computing", name: "Computing" },
      { key: "electronics_mobiles", name: "Mobile Phones" },
      { key: "electronics_accessories", name: "Accessories" },
    ],
  },
  {
    key: "outdoor_garden",
    name: "Outdoor & Garden",
    children: [
      { key: "outdoor_furniture", name: "Outdoor Furniture" },
      { key: "outdoor_garden_tools", name: "Garden Tools" },
      { key: "outdoor_decor", name: "Outdoor Decor" },
    ],
  },
  {
    key: "toys_games",
    name: "Toys & Games",
    children: [
      { key: "toys_educational", name: "Educational" },
      { key: "toys_collectibles", name: "Collectibles" },
      { key: "toys_puzzles", name: "Puzzles" },
      { key: "toys_boardgames", name: "Board Games" },
    ],
  },
];
