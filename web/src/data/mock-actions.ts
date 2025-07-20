import { Action, ActionType } from "@/types/action";

export const mockActions: Action[] = [
  {
    id: "1",
    name: "Welcome Sound",
    description: "Play welcome sound for new followers",
    type: ActionType.SOUND,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    enabled: true,
    config: {
      soundConfig: {
        filePath: "/sounds/welcome.mp3",
        volume: 0.8,
        loop: false,
      },
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Follow Alert",
    description: "Show overlay alert for new followers",
    type: ActionType.OVERLAY,
    image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=200&h=200&fit=crop",
    enabled: true,
    config: {
      overlayConfig: {
        text: "Thanks for following!",
        duration: 5000,
        position: "top",
        style: {
          fontSize: 24,
          color: "#ffffff",
          backgroundColor: "#7c3aed",
        },
      },
    },
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
  },
  {
    id: "3",
    name: "Gaming Scene",
    description: "Switch to gaming scene layout",
    type: ActionType.SCENE,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop",
    enabled: false,
    config: {
      sceneConfig: {
        sceneName: "Gaming Layout",
        transition: "fade",
      },
    },
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "4",
    name: "Thank You Message",
    description: "Send thank you message to chat",
    type: ActionType.CHAT,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop",
    enabled: true,
    config: {
      chatConfig: {
        message: "Thank you for the support! 💜",
        username: "StreamBot",
      },
    },
    createdAt: "2024-01-15T13:00:00Z",
    updatedAt: "2024-01-15T13:00:00Z",
  },
  {
    id: "5",
    name: "Intro Video",
    description: "Play stream intro video",
    type: ActionType.MEDIA,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop",
    enabled: true,
    config: {
      mediaConfig: {
        filePath: "/videos/intro.mp4",
        autoPlay: true,
        loop: false,
      },
    },
    createdAt: "2024-01-15T14:00:00Z",
    updatedAt: "2024-01-15T14:00:00Z",
  },
  {
    id: "6",
    name: "Discord Webhook",
    description: "Send notification to Discord channel",
    type: ActionType.WEBHOOK,
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=200&h=200&fit=crop",
    enabled: false,
    config: {
      webhookConfig: {
        url: "https://discord.com/api/webhooks/123456789/abcdef",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Stream is now live! 🎮",
        }),
      },
    },
    createdAt: "2024-01-15T15:00:00Z",
    updatedAt: "2024-01-15T15:00:00Z",
  },
];

export const getActionTypeIcon = (type: ActionType): string => {
  switch (type) {
  case ActionType.SOUND:
    return "volume-2";
  case ActionType.OVERLAY:
    return "layers";
  case ActionType.CHAT:
    return "message-circle";
  case ActionType.SCENE:
    return "monitor";
  case ActionType.MEDIA:
    return "play-circle";
  case ActionType.WEBHOOK:
    return "webhook";
  default:
    return "zap";
  }
};

export const getActionTypeLabel = (type: ActionType): string => {
  switch (type) {
  case ActionType.SOUND:
    return "Sound";
  case ActionType.OVERLAY:
    return "Overlay";
  case ActionType.CHAT:
    return "Chat Message";
  case ActionType.SCENE:
    return "Scene Change";
  case ActionType.MEDIA:
    return "Media";
  case ActionType.WEBHOOK:
    return "Webhook";
  default:
    return "Unknown";
  }
};
