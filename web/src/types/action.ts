export interface Action {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  isActive: boolean;
  config: ActionConfig;
  createdAt: string;
  updatedAt: string;
}

export type ActionType =
  | "disable_skill"
  | "press_key"
  | "stream-action"
  | "simple-action";

export interface ActionConfig {
  emoji: string;
  bitCost: number;
  duration?: number;
  timer?: number;
  skillKey?: string;
  albionItem?: AlbionItemConfig;
  customImage?: CustomImageConfig;
}

export interface CustomImageConfig {
  url: string;
  filename: string;
}

export interface AlbionItemConfig {
  uniqueName: string;
  name: string;
  quality: number;
  imageUrl: string;
}

export interface CreateActionRequest {
  name: string;
  description: string;
  type: ActionType;
  config: ActionConfig;
}

export interface UpdateActionRequest extends Partial<CreateActionRequest> {
  id: string;
}
