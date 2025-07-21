export interface User {
  userId: string;
  twitchId: string;
  username: string;
  displayName: string;
  profileImage: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface TwitchAuthResponse {
  token: string;
  user: User;
  refreshToken: string;
  expiresIn: number;
}