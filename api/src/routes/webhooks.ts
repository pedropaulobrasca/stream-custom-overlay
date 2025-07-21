import express from "express";
import crypto from "crypto";
import { TWITCH_CONFIG } from "../config/twitch";
import { broadcastToUser } from "./sse";

const router = express.Router();

interface EventData {
  type: string;
  user?: string;
  userId?: string;
  bits?: number;
  message?: string;
  reward?: {
    id: string;
    title: string;
    cost: number;
  };
  userInput?: string;
  tier?: string;
  isGift?: boolean;
  timestamp: string;
}

// Middleware to verify Twitch webhook signature
const verifyTwitchSignature = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const signature = req.headers["twitch-eventsub-message-signature"] as string;
  const timestamp = req.headers["twitch-eventsub-message-timestamp"] as string;
  const messageId = req.headers["twitch-eventsub-message-id"] as string;

  if (!signature || !timestamp || !messageId) {
    res.status(400).json({ error: "Missing required headers" });
    return;
  }

  // Verify timestamp (should be within 10 minutes)
  const timestampMs = parseInt(timestamp) * 1000;
  const now = Date.now();
  if (Math.abs(now - timestampMs) > 10 * 60 * 1000) {
    res.status(400).json({ error: "Request too old" });
    return;
  }

  // Verify signature
  const message = messageId + timestamp + JSON.stringify(req.body);
  const expectedSignature = "sha256=" + crypto
    .createHmac("sha256", TWITCH_CONFIG.WEBHOOK_SECRET)
    .update(message)
    .digest("hex");

  if (signature !== expectedSignature) {
    res.status(403).json({ error: "Invalid signature" });
    return;
  }

  next();
};

// Twitch webhook endpoint
router.post("/twitch", express.raw({ type: "application/json" }), verifyTwitchSignature, (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"] as string;

  // Parse the JSON body
  let body;
  try {
    body = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  switch (messageType) {
  case "webhook_callback_verification":
    // Respond with the challenge for webhook verification
    console.log("Webhook verification request received");
    return res.status(200).send(body.challenge);

  case "notification": {
    // Handle the actual event notification
    console.log("Webhook notification received:", body);

    const event = body.event;
    const subscription = body.subscription;

    // Handle different event types
    switch (subscription.type) {
    case "channel.cheer": {
      const eventData = handleCheerEvent(event);
      broadcastToUser(event.broadcaster_user_id, eventData);
      break;
    }
    case "channel.channel_points_custom_reward_redemption.add": {
      const eventData = handleChannelPointRedemption(event);
      broadcastToUser(event.broadcaster_user_id, eventData);
      break;
    }
    case "channel.follow": {
      const eventData = handleFollowEvent(event);
      broadcastToUser(event.broadcaster_user_id, eventData);
      break;
    }
    case "channel.subscribe": {
      const eventData = handleSubscribeEvent(event);
      broadcastToUser(event.broadcaster_user_id, eventData);
      break;
    }
    default:
      console.log("Unhandled event type:", subscription.type);
    }

    return res.status(204).send();
  }

  case "revocation":
    // Handle webhook revocation
    console.log("Webhook revoked:", body);
    return res.status(204).send();

  default:
    console.log("Unknown message type:", messageType);
    return res.status(400).json({ error: "Unknown message type" });
  }
});

// Event handlers
function handleCheerEvent(event: any): EventData {
  console.log("Cheer event:", event);

  return {
    type: "CHEER",
    user: event.user_name || event.user_login,
    userId: event.user_id,
    bits: event.bits,
    message: event.message,
    timestamp: new Date().toISOString(),
  };
}

function handleChannelPointRedemption(event: any): EventData {
  console.log("Channel point redemption:", event);

  return {
    type: "CHANNEL_POINT_REDEMPTION",
    user: event.user_name,
    userId: event.user_id,
    reward: {
      id: event.reward.id,
      title: event.reward.title,
      cost: event.reward.cost,
    },
    userInput: event.user_input,
    timestamp: new Date().toISOString(),
  };
}

function handleFollowEvent(event: any): EventData {
  console.log("Follow event:", event);

  return {
    type: "FOLLOW",
    user: event.user_name,
    userId: event.user_id,
    timestamp: new Date().toISOString(),
  };
}

function handleSubscribeEvent(event: any): EventData {
  console.log("Subscribe event:", event);

  return {
    type: "SUBSCRIBE",
    user: event.user_name,
    userId: event.user_id,
    tier: event.tier,
    isGift: event.is_gift,
    timestamp: new Date().toISOString(),
  };
}

export default router;