import axios from "axios";

export class AlbionDataService {
  static async fetchMarketData(
    city: string,
    category: string,
    serverUrl: string
  ): Promise<ProfitItem[]> {
    const itemList = getItemsByCategory(category as ItemCategory);
    if (itemList.length === 0) {
      throw new Error("No items found for selected category");
    }

    // Split items into chunks of 50
    const chunks = this.chunkArray(itemList, 50);

    // Fetch all chunks in parallel
    const allCityData: MarketDataEntry[] = [];
    const allBlackMarketData: MarketDataEntry[] = [];

    for (const chunk of chunks) {
      const itemQuery = chunk.join(",");

      // Fetch city and black market prices for this chunk
      const [cityData, blackMarketData] = await Promise.all([
        this.fetchPrices(itemQuery, city, serverUrl),
        this.fetchPrices(itemQuery, "blackmarket", serverUrl),
      ]);

      allCityData.push(...cityData);
      allBlackMarketData.push(...blackMarketData);
    }

    return this.calculateProfits(allCityData, allBlackMarketData);
  }
}
