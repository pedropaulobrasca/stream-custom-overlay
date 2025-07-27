// Utility functions for Albion Online integration

export interface AlbionItem {
  uniqueName: string;
  name: string;
  quality: number;
  imageUrl?: string;
}

export interface AlbionItemWithDetails extends AlbionItem {
  tier: number;
  enchantment: number;
  category: string;
  subcategory?: string;
}

/**
 * Get the official Albion Online item render URL
 * @param uniqueName - The unique name of the item (e.g., "T4_SWORD")
 * @param quality - Item quality (1-5)
 * @param size - Image size (64, 128, 217 available)
 * @returns URL string for the item image
 */
export const getAlbionItemImageUrl = (
  uniqueName: string,
  quality: number = 1,
  size: number = 217,
): string => {
  return `https://render.albiononline.com/v1/item/${uniqueName}.png?quality=${quality}&size=${size}`;
};

/**
 * Get quality display name
 * @param quality - Item quality number (1-5)
 * @returns Human readable quality name
 */
export const getQualityName = (quality: number): string => {
  switch (quality) {
  case 1: return "Normal";
  case 2: return "Good";
  case 3: return "Outstanding";
  case 4: return "Excellent";
  case 5: return "Masterpiece";
  default: return "Normal";
  }
};

/**
 * Get quality color class
 * @param quality - Item quality number (1-5)
 * @returns Tailwind color class
 */
export const getQualityColor = (quality: number): string => {
  switch (quality) {
  case 1: return "text-gray-400";
  case 2: return "text-green-400";
  case 3: return "text-blue-400";
  case 4: return "text-purple-400";
  case 5: return "text-orange-400";
  default: return "text-gray-400";
  }
};

/**
 * Get quality background color class
 * @param quality - Item quality number (1-5)
 * @returns Tailwind background color class
 */
export const getQualityBgColor = (quality: number): string => {
  switch (quality) {
  case 1: return "bg-gray-500";
  case 2: return "bg-green-500";
  case 3: return "bg-blue-500";
  case 4: return "bg-purple-500";
  case 5: return "bg-orange-500";
  default: return "bg-gray-500";
  }
};

/**
 * Extract tier from item unique name
 * @param uniqueName - Item unique name (e.g., "T4_SWORD")
 * @returns Tier number or 0 if not found
 */
export const extractTier = (uniqueName: string): number => {
  const match = uniqueName.match(/T(\d)/);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Extract enchantment level from item unique name
 * @param uniqueName - Item unique name (e.g., "T4_SWORD@2")
 * @returns Enchantment level or 0 if not found
 */
export const extractEnchantment = (uniqueName: string): number => {
  const match = uniqueName.match(/@(\d)/);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Format tier display text
 * @param tier - Tier number
 * @param enchantment - Enchantment level (optional)
 * @returns Formatted tier string (e.g., "T4.2")
 */
export const formatTierDisplay = (tier: number, enchantment?: number): string => {
  if (enchantment && enchantment > 0) {
    return `T${tier}.${enchantment}`;
  }
  return `T${tier}`;
};

/**
 * Check if an item name/unique name contains Albion-specific keywords
 * @param name - Item name or unique name
 * @returns Boolean indicating if it's likely an Albion item
 */
export const isAlbionItem = (name: string): boolean => {
  const albionKeywords = [
    "T1_", "T2_", "T3_", "T4_", "T5_", "T6_", "T7_", "T8_",
    "SWORD", "AXE", "BOW", "CROSSBOW", "HAMMER", "MACE", "SPEAR", "STAFF",
    "ARMOR", "HEAD", "SHOES", "BAG", "CAPE", "MOUNT", "POTION",
  ];

  return albionKeywords.some(keyword => name.toUpperCase().includes(keyword));
};

/**
 * Get market cities list
 * @returns Array of Albion Online city names
 */
export const getMarketCities = (): string[] => {
  return [
    "Caerleon",
    "Bridgewatch",
    "Lymhurst",
    "Martlock",
    "Fort Sterling",
    "Thetford",
  ];
};

/**
 * Format silver amount for display
 * @param silver - Silver amount
 * @param abbreviated - Whether to use abbreviated format (1.2K, 1.5M)
 * @returns Formatted silver string
 */
export const formatSilver = (silver: number, abbreviated: boolean = false): string => {
  if (!abbreviated) {
    return silver.toLocaleString();
  }

  if (silver >= 1000000) {
    return `${(silver / 1000000).toFixed(1)}M`;
  } else if (silver >= 1000) {
    return `${(silver / 1000).toFixed(1)}K`;
  }
  return silver.toString();
};

/**
 * Calculate profit margin percentage
 * @param sellPrice - Sell price
 * @param buyPrice - Buy price
 * @returns Profit margin as percentage
 */
export const calculateProfitMargin = (sellPrice: number, buyPrice: number): number => {
  if (buyPrice === 0) return 0;
  return ((sellPrice - buyPrice) / buyPrice) * 100;
};
