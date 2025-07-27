/**
 * Albion Online utility functions for image URLs and item handling
 */

export function getAlbionItemImageUrl(uniqueName: string, quality: number = 1): string {
  return `https://render.albiononline.com/v1/item/${uniqueName}.png?quality=${quality}`;
}

export function getAlbionItemThumbnailUrl(uniqueName: string, quality: number = 1): string {
  return `https://render.albiononline.com/v1/item/${uniqueName}.png?quality=${quality}&size=64`;
}

export interface AlbionItem {
  UniqueName: string;
  LocalizedNames: {
    "EN-US": string;
  };
  LocalizedDescriptions?: {
    "EN-US": string;
  };
  Index: string;
}

export interface ProcessedAlbionItem {
  uniqueName: string;
  name: string;
  quality: number;
  imageUrl: string;
}
