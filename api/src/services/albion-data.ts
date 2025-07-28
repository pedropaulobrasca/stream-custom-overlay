import axios from "axios";

// Temporary placeholder types
interface ProfitItem {
  id: string;
  name: string;
  profit: number;
}

export class AlbionDataService {
  static async fetchMarketData(
    city: string,
    category: string,
    serverUrl: string
  ): Promise<ProfitItem[]> {
    // Temporarily return empty array to fix build
    // TODO: Implement proper Albion market data fetching
    return [];
  }
}