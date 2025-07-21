import express from "express";
import { TwitchService } from "../services/twitch";
import { AuthenticatedRequest } from "../types/auth";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const twitchService = TwitchService.getInstance();

// Get bits leaderboard for authenticated user
router.get("/bits/leaderboard", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { count = 10 } = req.query;

    // Note: This requires a valid Twitch access token stored with the user
    // For now, we'll return mock data. In production, you'd store and use the actual token

    const mockData = {
      data: [
        {
          user_id: req.user.twitchId,
          user_login: req.user.username,
          user_name: req.user.displayName,
          rank: 1,
          score: 150,
        },
      ],
      date_range: {
        started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      },
      total: 1,
    };

    res.json(mockData);
  } catch (error) {
    console.error("Error fetching bits leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch bits leaderboard" });
  }
});

// Get cheermotes
router.get("/bits/cheermotes", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Mock cheermotes data
    const mockData = {
      data: [
        {
          prefix: "cheer",
          tiers: [
            {
              min_bits: 1,
              id: "1",
              color: "#979797",
              images: {
                dark: {
                  animated: {
                    "1": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/1/1.gif",
                    "2": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/1/2.gif",
                  },
                  static: {
                    "1": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/1/1.png",
                    "2": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/1/2.png",
                  },
                },
                light: {
                  animated: {
                    "1": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/light/animated/1/1.gif",
                    "2": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/light/animated/1/2.gif",
                  },
                  static: {
                    "1": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/light/static/1/1.png",
                    "2": "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/light/static/1/2.png",
                  },
                },
              },
            },
          ],
          type: "global_first_party",
          order: 1,
          last_updated: new Date().toISOString(),
          is_charitable: false,
        },
      ],
    };

    res.json(mockData);
  } catch (error) {
    console.error("Error fetching cheermotes:", error);
    res.status(500).json({ error: "Failed to fetch cheermotes" });
  }
});

// Get user channel information
router.get("/user/channel", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Mock channel data
    const mockData = {
      data: [
        {
          broadcaster_id: req.user.twitchId,
          broadcaster_login: req.user.username,
          broadcaster_name: req.user.displayName,
          broadcaster_language: "en",
          game_id: "509658",
          game_name: "Just Chatting",
          title: "Welcome to my stream!",
          delay: 0,
        },
      ],
    };

    res.json(mockData);
  } catch (error) {
    console.error("Error fetching channel info:", error);
    res.status(500).json({ error: "Failed to fetch channel info" });
  }
});

export default router;
