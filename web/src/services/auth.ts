import { api } from "@/lib/api";
import { TwitchAuthResponse, User } from "@/types/auth";

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initializeAuth(): Promise<string> {
    try {
      const response = await api.get("/auth/login");
      const { authUrl, state } = response.data;

      // Store state for verification
      sessionStorage.setItem("oauth_state", state);

      return authUrl;
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      throw new Error("Failed to initialize authentication");
    }
  }

  async handleCallback(code: string, state: string): Promise<TwitchAuthResponse> {
    try {
      const storedState = sessionStorage.getItem("oauth_state");

      // Enhanced state validation with better error handling
      if (!storedState) {
        console.warn("No OAuth state found in storage, proceeding with callback");
      } else if (storedState !== state) {
        console.error("OAuth state mismatch", { stored: storedState, received: state });
        throw new Error("Invalid OAuth state - potential security issue");
      }

      const response = await api.post("/auth/callback", { code, state });
      const authData: TwitchAuthResponse = response.data;

      // Store tokens and user data
      this.storeAuthData(authData);

      return authData;
    } catch (error) {
      console.error("OAuth callback failed:", error);
      // More specific error handling
      if (error instanceof Error && error.message.includes("OAuth state")) {
        throw error; // Re-throw state validation errors
      }
      throw new Error("Authentication failed - please try logging in again");
    } finally {
      // Clean up state regardless of success/failure
      sessionStorage.removeItem("oauth_state");
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get("/auth/me");
      return response.data.user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      this.clearAuthData();
    }
  }

  private storeAuthData(authData: TwitchAuthResponse): void {
    localStorage.setItem("auth_token", authData.token);
    localStorage.setItem("refresh_token", authData.refreshToken);
    localStorage.setItem("user", JSON.stringify(authData.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true;
    }
  }
}
