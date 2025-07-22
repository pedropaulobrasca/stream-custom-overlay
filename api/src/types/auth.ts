export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email?: string;
  profile_image_url: string;
  view_count: number;
  created_at: string;
}

export interface TwitchTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  scope: string[];
  expires_in: number;
}

export interface JWTPayload {
  userId: string;
  twitchId: string;
  username: string;
  displayName: string;
  profileImage: string;
  iat?: number;
  exp?: number;
}

import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
