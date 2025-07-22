import axios from "axios";
import { TWITCH_CONFIG } from "../config/twitch";
import { TwitchTokenResponse, TwitchUser } from "../types/auth";

export class TwitchService {
  private static instance: TwitchService;

  public static getInstance(): TwitchService {
    if (!TwitchService.instance) {
      TwitchService.instance = new TwitchService();
    }
    return TwitchService.instance;
  }

  public getAuthUrl(state: string): string {
    const params = new global.URLSearchParams({
      client_id: TWITCH_CONFIG.CLIENT_ID,
      redirect_uri: TWITCH_CONFIG.REDIRECT_URI,
      response_type: "code",
      scope: TWITCH_CONFIG.SCOPES.join(" "),
      state,
    });

    return `${TWITCH_CONFIG.AUTH_URL}/authorize?${params.toString()}`;
  }

  public async exchangeCodeForTokens(code: string): Promise<TwitchTokenResponse> {
    try {
      const response = await axios.post(`${TWITCH_CONFIG.AUTH_URL}/token`, {
        client_id: TWITCH_CONFIG.CLIENT_ID,
        client_secret: TWITCH_CONFIG.CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: TWITCH_CONFIG.REDIRECT_URI,
      });

      return response.data;
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      throw new Error("Failed to exchange code for tokens");
    }
  }

  public async getUserInfo(accessToken: string): Promise<TwitchUser> {
    try {
      const response = await axios.get(`${TWITCH_CONFIG.BASE_URL}/users`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Client-Id": TWITCH_CONFIG.CLIENT_ID,
        },
      });

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error("No user data returned from Twitch");
      }

      return response.data.data[0];
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw new Error("Failed to fetch user info");
    }
  }

  public async refreshToken(refreshToken: string): Promise<TwitchTokenResponse> {
    try {
      const response = await axios.post(`${TWITCH_CONFIG.AUTH_URL}/token`, {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: TWITCH_CONFIG.CLIENT_ID,
        client_secret: TWITCH_CONFIG.CLIENT_SECRET,
      });

      return response.data;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error("Failed to refresh token");
    }
  }

  public async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get(`${TWITCH_CONFIG.AUTH_URL}/validate`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      return response.status === 200;
    } catch {
      return false;
    }
  }

  public async getBitsLeaderboard(accessToken: string, userId: string, count = 10): Promise<unknown> {
    try {
      const response = await axios.get(`${TWITCH_CONFIG.BASE_URL}/bits/leaderboard`, {
        params: {
          count,
          period: "week",
          started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: userId,
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Client-Id": TWITCH_CONFIG.CLIENT_ID,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching bits leaderboard:", error);
      throw new Error("Failed to fetch bits leaderboard");
    }
  }

  public async getCheermotes(accessToken: string, broadcasterId?: string): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (broadcasterId) {
        params.broadcaster_id = broadcasterId;
      }

      const response = await axios.get(`${TWITCH_CONFIG.BASE_URL}/bits/cheermotes`, {
        params,
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Client-Id": TWITCH_CONFIG.CLIENT_ID,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching cheermotes:", error);
      throw new Error("Failed to fetch cheermotes");
    }
  }
}
