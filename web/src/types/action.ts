export interface Action {
  id: string;
  name: string;
  description: string;
  type: ActionType;
  image: string;
  enabled: boolean;
  config: ActionConfig;
  createdAt: string;
  updatedAt: string;
}

export enum ActionType {
  OVERLAY = "overlay",
  CHAT = "chat",
  SCENE = "scene",
  MEDIA = "media",
  WEBHOOK = "webhook"
}

export interface ActionConfig {
  overlayConfig?: OverlayConfig;
  chatConfig?: ChatConfig;
  sceneConfig?: SceneConfig;
  mediaConfig?: MediaConfig;
  webhookConfig?: WebhookConfig;
}

export interface OverlayConfig {
  text: string;
  duration: number;
  position: "top" | "center" | "bottom";
  style: {
    fontSize: number;
    color: string;
    backgroundColor: string;
  };
}

export interface ChatConfig {
  message: string;
  username?: string;
}

export interface SceneConfig {
  sceneName: string;
  transition?: string;
}

export interface MediaConfig {
  filePath: string;
  autoPlay: boolean;
  loop: boolean;
}

export interface WebhookConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
}

export interface CreateActionRequest {
  name: string;
  description: string;
  type: ActionType;
  image: string;
  config: ActionConfig;
}

export interface UpdateActionRequest extends Partial<CreateActionRequest> {
  id: string;
}
