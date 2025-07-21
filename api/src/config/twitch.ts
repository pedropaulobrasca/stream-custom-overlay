import dotenv from "dotenv";
dotenv.config();

export const TWITCH_CONFIG = {
  CLIENT_ID: process.env.TWITCH_CLIENT_ID!,
  CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET!,
  REDIRECT_URI: process.env.TWITCH_REDIRECT_URI!,
  SCOPES: [
    "user:read:email",
    "bits:read",
    "channel:read:subscriptions",
    "channel:read:redemptions",
    "moderator:read:followers",
  ],
  BASE_URL: "https://api.twitch.tv/helix",
  AUTH_URL: "https://id.twitch.tv/oauth2",
  WEBHOOK_SECRET: process.env.TWITCH_WEBHOOK_SECRET!,
};

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET!,
  EXPIRES_IN: "7d",
};
