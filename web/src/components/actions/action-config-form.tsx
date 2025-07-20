import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionType, ActionConfig } from "@/types/action";

interface ActionConfigFormProps {
  type: ActionType;
  value: ActionConfig;
  onChange: (config: ActionConfig) => void;
}

export function ActionConfigForm({ type, value, onChange }: ActionConfigFormProps) {
  const updateConfig = (key: string, configValue: Record<string, unknown>) => {
    onChange({
      ...value,
      [key]: {
        ...value[key as keyof ActionConfig],
        ...configValue,
      },
    });
  };

  switch (type) {
  case ActionType.SOUND:
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Sound Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sound-file">Sound File Path</Label>
            <Input
              id="sound-file"
              placeholder="/sounds/example.mp3"
              value={value.soundConfig?.filePath || ""}
              onChange={(e) => updateConfig("soundConfig", { filePath: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sound-volume">Volume (0-1)</Label>
            <Input
              id="sound-volume"
              type="number"
              min="0"
              max="1"
              step="0.1"
              placeholder="0.8"
              value={value.soundConfig?.volume || ""}
              onChange={(e) => updateConfig("soundConfig", { volume: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={value.soundConfig?.loop || false}
            onCheckedChange={(checked: boolean) => updateConfig("soundConfig", { loop: checked })}
          />
          <Label>Loop sound</Label>
        </div>
      </div>
    );

  case ActionType.OVERLAY:
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Overlay Configuration</h4>
        <div className="space-y-2">
          <Label htmlFor="overlay-text">Text</Label>
          <Textarea
            id="overlay-text"
            placeholder="Overlay text to display"
            value={value.overlayConfig?.text || ""}
            onChange={(e) => updateConfig("overlayConfig", { text: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="overlay-duration">Duration (ms)</Label>
            <Input
              id="overlay-duration"
              type="number"
              placeholder="5000"
              value={value.overlayConfig?.duration || ""}
              onChange={(e) => updateConfig("overlayConfig", { duration: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="overlay-position">Position</Label>
            <Select
              value={value.overlayConfig?.position || "top"}
              onValueChange={(pos: "top" | "center" | "bottom") => updateConfig("overlayConfig", { position: pos })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="overlay-font-size">Font Size</Label>
            <Input
              id="overlay-font-size"
              type="number"
              placeholder="24"
              value={value.overlayConfig?.style?.fontSize || ""}
              onChange={(e) => updateConfig("overlayConfig", {
                style: {
                  ...value.overlayConfig?.style,
                  fontSize: parseInt(e.target.value) || 16,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="overlay-color">Text Color</Label>
            <Input
              id="overlay-color"
              type="color"
              value={value.overlayConfig?.style?.color || "#ffffff"}
              onChange={(e) => updateConfig("overlayConfig", {
                style: {
                  ...value.overlayConfig?.style,
                  color: e.target.value,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="overlay-bg-color">Background Color</Label>
            <Input
              id="overlay-bg-color"
              type="color"
              value={value.overlayConfig?.style?.backgroundColor || "#000000"}
              onChange={(e) => updateConfig("overlayConfig", {
                style: {
                  ...value.overlayConfig?.style,
                  backgroundColor: e.target.value,
                },
              })}
            />
          </div>
        </div>
      </div>
    );

  case ActionType.CHAT:
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Chat Configuration</h4>
        <div className="space-y-2">
          <Label htmlFor="chat-message">Message</Label>
          <Textarea
            id="chat-message"
            placeholder="Message to send to chat"
            value={value.chatConfig?.message || ""}
            onChange={(e) => updateConfig("chatConfig", { message: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chat-username">Username (Optional)</Label>
          <Input
            id="chat-username"
            placeholder="Bot username"
            value={value.chatConfig?.username || ""}
            onChange={(e) => updateConfig("chatConfig", { username: e.target.value })}
          />
        </div>
      </div>
    );

  case ActionType.SCENE:
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Scene Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scene-name">Scene Name</Label>
            <Input
              id="scene-name"
              placeholder="Scene name in OBS"
              value={value.sceneConfig?.sceneName || ""}
              onChange={(e) => updateConfig("sceneConfig", { sceneName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scene-transition">Transition (Optional)</Label>
            <Select
              value={value.sceneConfig?.transition || "fade"}
              onValueChange={(transition: string) => updateConfig("sceneConfig", { transition })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="cut">Cut</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );

  case ActionType.MEDIA:
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Media Configuration</h4>
        <div className="space-y-2">
          <Label htmlFor="media-file">Media File Path</Label>
          <Input
            id="media-file"
            placeholder="/videos/example.mp4"
            value={value.mediaConfig?.filePath || ""}
            onChange={(e) => updateConfig("mediaConfig", { filePath: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.mediaConfig?.autoPlay || false}
              onCheckedChange={(checked: boolean) => updateConfig("mediaConfig", { autoPlay: checked })}
            />
            <Label>Auto Play</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.mediaConfig?.loop || false}
              onCheckedChange={(checked: boolean) => updateConfig("mediaConfig", { loop: checked })}
            />
            <Label>Loop</Label>
          </div>
        </div>
      </div>
    );

  case ActionType.WEBHOOK:
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Webhook Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://api.example.com/webhook"
              value={value.webhookConfig?.url || ""}
              onChange={(e) => updateConfig("webhookConfig", { url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-method">Method</Label>
            <Select
              value={value.webhookConfig?.method || "POST"}
              onValueChange={(method: "GET" | "POST" | "PUT" | "DELETE") => updateConfig("webhookConfig", { method })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhook-headers">Headers (JSON)</Label>
          <Textarea
            id="webhook-headers"
            placeholder='{"Content-Type": "application/json"}'
            value={JSON.stringify(value.webhookConfig?.headers || {}, null, 2)}
            onChange={(e) => {
              try {
                const headers = JSON.parse(e.target.value);
                updateConfig("webhookConfig", { headers });
              } catch {
                // Invalid JSON, keep the raw value for now
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhook-body">Body (JSON)</Label>
          <Textarea
            id="webhook-body"
            placeholder='{"message": "Hello World"}'
            value={value.webhookConfig?.body || ""}
            onChange={(e) => updateConfig("webhookConfig", { body: e.target.value })}
          />
        </div>
      </div>
    );

  default:
    return <div>Select an action type to configure</div>;
  }
}
