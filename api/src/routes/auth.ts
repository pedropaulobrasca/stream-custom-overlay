import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { TwitchService } from "../services/twitch";
import { UserService } from "../services/user";
import { JWT_CONFIG, TWITCH_CONFIG } from "../config/twitch";
import { JWTPayload, AuthenticatedRequest } from "../types/auth";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const twitchService = TwitchService.getInstance();
const userService = UserService.getInstance();

// In-memory store for state tokens (in production, use Redis)
const stateStore = new Map<string, { timestamp: number }>();

// Clean expired states every 5 minutes
// eslint-disable-next-line no-undef
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
      stateStore.delete(state);
    }
  }
}, 5 * 60 * 1000);

// Generate auth URL
router.get("/login", (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    stateStore.set(state, { timestamp: Date.now() });

    const authUrl = twitchService.getAuthUrl(state);
    res.json({ authUrl, state });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

// Handle OAuth callback
router.post("/callback", async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state" });
    }

    // Verify state
    if (!stateStore.has(state)) {
      return res.status(400).json({ error: "Invalid or expired state" });
    }
    stateStore.delete(state);

    // Exchange code for tokens
    const tokens = await twitchService.exchangeCodeForTokens(code);

    // Get user info from Twitch
    const twitchUser = await twitchService.getUserInfo(tokens.access_token);

    // Create or update user in database
    const user = await userService.createOrUpdateFromTwitch(twitchUser);

    // Store Twitch integration data
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await userService.storeTwitchIntegration(
      user.id,
      tokens.access_token,
      tokens.refresh_token,
      expiresAt,
      TWITCH_CONFIG.SCOPES,
    );

    // Create JWT payload
    const payload: JWTPayload = {
      userId: user.id,
      twitchId: user.twitchId,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
    };

    // Generate JWT
    const jwtToken = jwt.sign(payload, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.EXPIRES_IN,
    } as jwt.SignOptions);

    // Store user session
    await userService.createSession(user.id, jwtToken, tokens.refresh_token, expiresAt);

    res.json({
      token: jwtToken,
      user: payload,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Refresh Twitch token
    const tokens = await twitchService.refreshToken(refreshToken);

    // Get updated user info
    const twitchUser = await twitchService.getUserInfo(tokens.access_token);

    // Create new JWT payload
    const payload: JWTPayload = {
      userId: `twitch_${twitchUser.id}`,
      twitchId: twitchUser.id,
      username: twitchUser.login,
      displayName: twitchUser.display_name,
      profileImage: twitchUser.profile_image_url,
    };

    // Generate new JWT
    const jwtToken = jwt.sign(payload, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.EXPIRES_IN,
    } as jwt.SignOptions);

    res.json({
      token: jwtToken,
      user: payload,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ error: "Failed to refresh token" });
  }
});

// Get current user
router.get("/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// Logout (client-side token removal, optionally revoke Twitch token)
router.post("/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // In a more complete implementation, you might:
    // 1. Revoke the Twitch token
    // 2. Add the JWT to a blacklist
    // 3. Clear any stored refresh tokens

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
