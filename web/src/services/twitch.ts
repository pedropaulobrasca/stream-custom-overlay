import { api } from '@/lib/api';

export interface BitsLeaderboard {
  data: {
    user_id: string;
    user_login: string;
    user_name: string;
    rank: number;
    score: number;
  }[];
  date_range: {
    started_at: string;
    ended_at: string;
  };
  total: number;
}

export interface Cheermote {
  prefix: string;
  tiers: {
    min_bits: number;
    id: string;
    color: string;
    images: {
      dark: {
        animated: { [key: string]: string };
        static: { [key: string]: string };
      };
      light: {
        animated: { [key: string]: string };
        static: { [key: string]: string };
      };
    };
  }[];
  type: string;
  order: number;
  last_updated: string;
  is_charitable: boolean;
}

export interface ChannelInfo {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
  delay: number;
}

export class TwitchAPIService {
  private static instance: TwitchAPIService;

  public static getInstance(): TwitchAPIService {
    if (!TwitchAPIService.instance) {
      TwitchAPIService.instance = new TwitchAPIService();
    }
    return TwitchAPIService.instance;
  }

  async getBitsLeaderboard(count = 10): Promise<BitsLeaderboard> {
    try {
      const response = await api.get(`/twitch/bits/leaderboard?count=${count}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bits leaderboard:', error);
      throw new Error('Failed to fetch bits leaderboard');
    }
  }

  async getCheermotes(): Promise<{ data: Cheermote[] }> {
    try {
      const response = await api.get('/twitch/bits/cheermotes');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cheermotes:', error);
      throw new Error('Failed to fetch cheermotes');
    }
  }

  async getChannelInfo(): Promise<{ data: ChannelInfo[] }> {
    try {
      const response = await api.get('/twitch/user/channel');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch channel info:', error);
      throw new Error('Failed to fetch channel info');
    }
  }
}