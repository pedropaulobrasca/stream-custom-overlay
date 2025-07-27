// Albion Online Data API Client
// Documentation: https://www.albion-online-data.com/api-info/api-info.html

interface ApiRegion {
  name: string;
  host: string;
}

interface PriceData {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

interface HistoryData {
  item_id: string;
  city: string;
  quality: number;
  data: Array<{
    timestamp: string;
    avg_price: number;
    item_count: number;
  }>;
}

interface GoldData {
  timestamp: string;
  price: number;
}

export interface AlbionMarketPrice {
  itemId: string;
  itemName: string;
  city: string;
  quality: number;
  sellPrice: number;
  buyPrice: number;
  lastUpdate: string;
  trend: "up" | "down" | "stable";
}

class AlbionDataApiClient {
  private regions: ApiRegion[] = [
    { name: "Americas", host: "https://west.albion-online-data.com" },
    { name: "Europe", host: "https://europe.albion-online-data.com" },
    { name: "Asia", host: "https://east.albion-online-data.com" },
  ];

  private defaultRegion = this.regions[1]; // Europe as default
  private requestQueue: Array<() => Promise<any>> = [];
  private lastRequestTime = 0;
  private requestCount = 0;
  private minuteRequestCount = 0;
  private fiveMinuteRequestCount = 0;

  // Rate limiting: 180 requests per minute, 300 requests per 5 minutes
  private async handleRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset counters if needed
    if (now - this.lastRequestTime > 60000) {
      this.minuteRequestCount = 0;
    }
    if (now - this.lastRequestTime > 300000) {
      this.fiveMinuteRequestCount = 0;
    }

    // Check rate limits
    if (this.minuteRequestCount >= 180 || this.fiveMinuteRequestCount >= 300) {
      const waitTime = this.minuteRequestCount >= 180 ? 60000 : 300000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.minuteRequestCount++;
    this.fiveMinuteRequestCount++;
    this.lastRequestTime = now;
  }

  private async makeRequest<T>(endpoint: string, region?: ApiRegion): Promise<T> {
    await this.handleRateLimit();

    const selectedRegion = region || this.defaultRegion;
    const url = `${selectedRegion.host}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "Accept-Encoding": "gzip",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Albion Data API request failed:", error);
      throw error;
    }
  }

  /**
   * Get current market prices for items
   * @param items - Array of item IDs (e.g., ['T4_SWORD', 'T5_BAG'])
   * @param locations - Array of city names (optional)
   * @param qualities - Array of quality levels 1-5 (optional)
   */
  async getCurrentPrices(
    items: string[],
    locations?: string[],
    qualities?: number[],
  ): Promise<PriceData[]> {
    const itemsParam = items.join(",");
    const params = new URLSearchParams();

    if (locations && locations.length > 0) {
      params.append("locations", locations.join(","));
    }

    if (qualities && qualities.length > 0) {
      params.append("qualities", qualities.join(","));
    }

    const queryString = params.toString();
    const endpoint = `/api/v2/stats/prices/${itemsParam}.json${queryString ? "?" + queryString : ""}`;

    return this.makeRequest<PriceData[]>(endpoint);
  }

  /**
   * Get historical price data for items
   * @param items - Array of item IDs
   * @param options - Optional parameters for filtering
   */
  async getHistoricalPrices(
    items: string[],
    options?: {
      date?: string;
      endDate?: string;
      locations?: string[];
      qualities?: number[];
      timeScale?: 1 | 24; // 1 = hourly, 24 = daily
    },
  ): Promise<HistoryData[]> {
    const itemsParam = items.join(",");
    const params = new URLSearchParams();

    if (options?.date) params.append("date", options.date);
    if (options?.endDate) params.append("end_date", options.endDate);
    if (options?.locations) params.append("locations", options.locations.join(","));
    if (options?.qualities) params.append("qualities", options.qualities.join(","));
    if (options?.timeScale) params.append("time-scale", options.timeScale.toString());

    const queryString = params.toString();
    const endpoint = `/api/v2/stats/history/${itemsParam}.json${queryString ? "?" + queryString : ""}`;

    return this.makeRequest<HistoryData[]>(endpoint);
  }

  /**
   * Get current gold prices
   * @param options - Optional parameters for filtering
   */
  async getGoldPrices(options?: {
    date?: string;
    endDate?: string;
    count?: number;
  }): Promise<GoldData[]> {
    const params = new URLSearchParams();

    if (options?.date) params.append("date", options.date);
    if (options?.endDate) params.append("end_date", options.endDate);
    if (options?.count) params.append("count", options.count.toString());

    const queryString = params.toString();
    const endpoint = `/api/v2/stats/gold.json${queryString ? "?" + queryString : ""}`;

    return this.makeRequest<GoldData[]>(endpoint);
  }

  /**
   * Helper method to get formatted market data
   * @param items - Array of item IDs
   * @param locations - Array of city names
   */
  async getMarketData(
    items: string[],
    locations: string[] = ["Caerleon", "Bridgewatch", "Lymhurst", "Martlock", "Fort Sterling", "Thetford"],
  ): Promise<AlbionMarketPrice[]> {
    try {
      const priceData = await this.getCurrentPrices(items, locations);

      // Convert to market data and filter out duplicates
      const marketData = priceData.map((item): AlbionMarketPrice => ({
        itemId: item.item_id,
        itemName: this.getItemDisplayName(item.item_id),
        city: item.city,
        quality: item.quality,
        sellPrice: item.sell_price_min || 0,
        buyPrice: item.buy_price_max || 0,
        lastUpdate: this.formatTimestamp(item.sell_price_min_date || item.buy_price_max_date),
        trend: this.calculateTrend(item),
      }));

      // Remove duplicates based on itemId + city + quality combination
      const uniqueData = marketData.filter((item, index, self) => 
        index === self.findIndex(t => 
          t.itemId === item.itemId && 
          t.city === item.city && 
          t.quality === item.quality
        )
      );

      return uniqueData;
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      return [];
    }
  }

  /**
   * Get the most profitable trading opportunities
   * @param items - Array of item IDs to check
   * @param minProfit - Minimum profit threshold
   */
  async getTradingOpportunities(
    items: string[],
    minProfit: number = 1000,
  ): Promise<AlbionMarketPrice[]> {
    const marketData = await this.getMarketData(items);

    return marketData
      .filter(item => (item.sellPrice - item.buyPrice) >= minProfit)
      .sort((a, b) => (b.sellPrice - b.buyPrice) - (a.sellPrice - a.buyPrice));
  }

  private getItemDisplayName(itemId: string): string {
    // This could be enhanced with a proper item database lookup
    return itemId.replace(/_/g, " ").replace(/T\d+/, (match) => `Tier ${match.slice(1)}`);
  }

  private formatTimestamp(timestamp: string): string {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  }

  private calculateTrend(item: PriceData): "up" | "down" | "stable" {
    // Simple trend calculation based on min/max prices
    // This could be enhanced with historical data
    const sellDiff = item.sell_price_max - item.sell_price_min;
    const sellAvg = (item.sell_price_max + item.sell_price_min) / 2;

    if (sellAvg === 0) return "stable";

    const changePercent = (sellDiff / sellAvg) * 100;

    if (changePercent > 5) return "up";
    if (changePercent < -5) return "down";
    return "stable";
  }

  /**
   * Set the preferred region for API requests
   * @param regionName - Name of the region ('Americas', 'Europe', 'Asia')
   */
  setRegion(regionName: string): void {
    const region = this.regions.find(r => r.name === regionName);
    if (region) {
      this.defaultRegion = region;
    }
  }

  /**
   * Get available regions
   */
  getRegions(): ApiRegion[] {
    return [...this.regions];
  }
}

// Export singleton instance
export const albionDataApi = new AlbionDataApiClient();

// Export commonly used item IDs for convenience
export const POPULAR_ITEMS = {
  WEAPONS: {
    SWORDS: ["T4_SWORD", "T5_SWORD", "T6_SWORD", "T7_SWORD", "T8_SWORD"],
    AXES: ["T4_AXE", "T5_AXE", "T6_AXE", "T7_AXE", "T8_AXE"],
    BOWS: ["T4_BOW", "T5_BOW", "T6_BOW", "T7_BOW", "T8_BOW"],
  },
  ARMOR: {
    CLOTH: ["T4_ARMOR_CLOTH_SET1", "T5_ARMOR_CLOTH_SET1", "T6_ARMOR_CLOTH_SET1"],
    LEATHER: ["T4_ARMOR_LEATHER_SET1", "T5_ARMOR_LEATHER_SET1", "T6_ARMOR_LEATHER_SET1"],
    PLATE: ["T4_ARMOR_PLATE_SET1", "T5_ARMOR_PLATE_SET1", "T6_ARMOR_PLATE_SET1"],
  },
  TOOLS: {
    GATHERING: ["T4_PICKAXE", "T5_PICKAXE", "T6_PICKAXE", "T7_PICKAXE", "T8_PICKAXE"],
  },
  RESOURCES: {
    ORE: ["T4_ROCK", "T5_ROCK", "T6_ROCK", "T7_ROCK", "T8_ROCK"],
    WOOD: ["T4_WOOD", "T5_WOOD", "T6_WOOD", "T7_WOOD", "T8_WOOD"],
  },
};

export default albionDataApi;
