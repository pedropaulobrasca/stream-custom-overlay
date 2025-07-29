import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Play, Zap } from "lucide-react";
import { useActions } from "@/hooks/useActions";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface Action {
  id: string;
  name: string;
  description: string;
  config: {
    emoji: string;
    bitCost: number;
    duration: number;
  };
  isActive: boolean;
}

interface TestEvent {
  id: string;
  actionId: string;
  actionName: string;
  username: string;
  bits: number;
  timestamp: Date;
}

export default function TestPanelPage() {
  const { user } = useAuth();
  const { actions, loading, error } = useActions();

  const [testEvents, setTestEvents] = useState<TestEvent[]>([]);
  const [testUsername, setTestUsername] = useState("TestUser123");
  const [customBits, setCustomBits] = useState<number | "">("");

  const triggerAction = async (action: any, customBitAmount?: number) => {
    const bitCost = action.config?.bitCost || 100;
    const bitsUsed = customBitAmount || bitCost;

    // Create test event
    const event: TestEvent = {
      id: `test_${Date.now()}`,
      actionId: action.id,
      actionName: action.name,
      username: testUsername,
      bits: bitsUsed,
      timestamp: new Date(),
    };

    setTestEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events

    // If it's a keyboard action (blocking or pressing), execute it via API
    if (["disable_skill", "press_key"].includes(action.type)) {
      try {
        const response = await api.post(`/actions/${action.id}/execute`, {
          triggeredBy: `test_panel_${testUsername}`,
        });

        const data = response.data;
        toast.success(`🎮 ${action.name} executed! ${data.desktopClientsNotified} desktop clients notified.`);

        if (data.punishment) {
          if (data.punishment.type.startsWith("block_key_")) {
            const keyName = data.punishment.type.replace("block_key_", "").toUpperCase();
            toast.info(`🚫 Blocking ${keyName} key for ${data.punishment.duration / 1000}s`);
          } else if (data.punishment.type.startsWith("press_key_")) {
            const keyName = data.punishment.type.replace("press_key_", "").toUpperCase();
            toast.info(`⚡ Pressed ${keyName} key automatically!`);
          }
        }

        // Create a manual execution event for overlay to show
        const manualEvent = {
          ...event,
          bits: 0, // 0 bits to indicate manual execution
          username: `${testUsername} (Test)`,
        };

        // Update the event in storage for overlay
        const overlayKey = `overlay_${user?.userId}_events`;
        const existingEvents = JSON.parse(localStorage.getItem(overlayKey) || "[]");
        existingEvents.unshift(manualEvent);
        const updatedEvents = existingEvents.slice(0, 50);
        localStorage.setItem(overlayKey, JSON.stringify(updatedEvents));

        // Broadcast to overlay
        try {
          const channel = new BroadcastChannel(`overlay_${user?.userId}`);
          channel.postMessage({
            type: "NEW_EVENT",
            event: manualEvent,
            allEvents: updatedEvents,
          });
          channel.close();
        } catch (error) {
          console.log("BroadcastChannel not supported:", error);
        }

      } catch (error: any) {
        console.error("Failed to execute keyboard action:", error);
        toast.error("Failed to execute keyboard action: " + (error.response?.data?.error || error.message));
      }
    } else {
      // Regular overlay action - show normal toast
      toast.success(`🎉 ${action.name} triggered! ${bitsUsed} bits from ${testUsername}`);
    }

    // Store in localStorage so overlay can potentially read it (simple demo)
    const overlayKey = `overlay_${user?.userId}_events`;
    const existingEvents = JSON.parse(localStorage.getItem(overlayKey) || "[]");
    existingEvents.unshift(event);
    const updatedEvents = existingEvents.slice(0, 50);
    localStorage.setItem(overlayKey, JSON.stringify(updatedEvents));

    // Force storage event for cross-tab communication
    // Note: storage events don't fire in the same tab, so we trigger manually
    const storageEvent = new StorageEvent("storage", {
      key: overlayKey,
      newValue: JSON.stringify(updatedEvents),
      oldValue: JSON.stringify(existingEvents),
    });

    // Dispatch to other windows/tabs
    setTimeout(() => {
      window.dispatchEvent(storageEvent);
    }, 100);

    // Also use BroadcastChannel for better cross-tab communication
    try {
      const channel = new BroadcastChannel(`overlay_${user?.userId}`);
      channel.postMessage({
        type: "NEW_EVENT",
        event: event,
        allEvents: updatedEvents,
      });
      channel.close();
      console.log("BroadcastChannel message sent");
    } catch (error) {
      console.log("BroadcastChannel not supported:", error);
    }

    // Also send to API for cross-platform communication (browser <-> OBS)
    try {
      const response = await fetch(`/api/events/${user?.userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        console.log("Event sent to API successfully");
      } else {
        console.error("Failed to send event to API:", response.status);
      }
    } catch (error) {
      console.error("Error sending event to API:", error);
    }

    console.log("Event stored and storage event dispatched:", { overlayKey, event, totalEvents: updatedEvents.length });
  };

  const quickTrigger = (action: Action) => {
    triggerAction(action);
  };

  const customTrigger = (action: any) => {
    const bitCost = action.config?.bitCost || 100;
    const bits = typeof customBits === "number" ? customBits : bitCost;
    triggerAction(action, bits);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading actions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading actions: {error}</p>
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Test Panel</h1>
            <p className="text-muted-foreground">
              Simulate bit donations to test overlay actions
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No actions available to test.</p>
          <p className="text-sm text-muted-foreground">
            Create your first action to start testing overlay functionality.
          </p>
        </div>
      </div>
    );
  }

  const clearEvents = async () => {
    const overlayKey = `overlay_${user?.userId}_events`;

    // Clear localStorage
    localStorage.removeItem(overlayKey);

    // Clear API
    try {
      const response = await fetch(`/api/events/${user?.userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Events cleared from API successfully");
      } else {
        console.error("Failed to clear events from API:", response.status);
      }
    } catch (error) {
      console.error("Error clearing events from API:", error);
    }

    // Clear local state
    setTestEvents([]);

    // Force storage event for overlay
    const storageEvent = new StorageEvent("storage", {
      key: overlayKey,
      newValue: null,
      oldValue: "[]",
    });

    setTimeout(() => {
      window.dispatchEvent(storageEvent);
    }, 100);

    toast.success("Events cleared!");
    console.log("Cleared events for key:", overlayKey);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Albion Online Test Panel</h1>
          <p className="text-muted-foreground">
            Simulate Twitch bit donations to test your Albion Online overlay actions
          </p>
        </div>
        <Button variant="destructive" onClick={clearEvents}>
          Clear Events
        </Button>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Configure test parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-username">Test Username</Label>
              <Input
                id="test-username"
                value={testUsername}
                onChange={(e) => setTestUsername(e.target.value)}
                placeholder="TestUser123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-bits">Custom Bits (optional)</Label>
              <Input
                id="custom-bits"
                type="number"
                value={customBits}
                onChange={(e) => setCustomBits(e.target.value ? parseInt(e.target.value) : "")}
                placeholder="Leave empty for default"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const bitCost = action.config?.bitCost || 100;
          const duration = action.config?.duration || 5;
          const emoji = action.config?.emoji || "⚡";

          return (
            <Card key={action.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {/* Matching overlay style */}
                  <div className="ring-2 ring-white/20 bg-black/20 w-16 h-16 rounded-2xl overflow-hidden backdrop-blur-sm relative">
                    {action.config?.albionItem ? (
                      <img
                        src={action.config.albionItem.imageUrl}
                        alt={action.config.albionItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = "none";
                          const sibling = target.nextElementSibling as HTMLElement;
                          if (sibling) sibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-xl ${!action.config?.albionItem ? "flex" : "hidden"}`}>
                      {emoji}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{action.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{bitCost} bits</Badge>
                      <Badge variant="outline">
                        {action.type === "disable_skill"
                          ? `${duration}s`
                          : action.type === "press_key"
                            ? `${duration}s cooldown`
                            : `${duration}min`}
                      </Badge>
                      {action.type === "disable_skill" && (
                        <Badge variant="destructive" className="text-xs">🚫 Block</Badge>
                      )}
                      {action.type === "press_key" && (
                        <Badge variant="default" className="text-xs">⚡ Press</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription>{action.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => quickTrigger(action)}
                  className="w-full"
                  variant="default"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quick Test ({bitCost} bits)
                </Button>
                <Button
                  onClick={() => customTrigger(action)}
                  className="w-full"
                  variant="outline"
                  disabled={!testUsername}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Custom Test ({typeof customBits === "number" ? customBits : bitCost} bits)
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Events</CardTitle>
          <CardDescription>Last triggered actions</CardDescription>
        </CardHeader>
        <CardContent>
          {testEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No events yet. Trigger some actions to see them here!
            </p>
          ) : (
            <div className="space-y-2">
              {testEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{event.bits} bits</Badge>
                    <span className="font-medium">{event.actionName}</span>
                    <span className="text-muted-foreground">by {event.username}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Quick Test:</strong> Triggers the action with its default bit cost</p>
            <p>• <strong>Custom Test:</strong> Uses the custom bits amount or default if not set</p>
            <p>• Configure username and custom bits in the test configuration above</p>
            <p>• Events are stored locally and can be read by the overlay (refresh overlay to see new events)</p>
            <p>• Overlay URL: <code>localhost:3000/overlay/{user?.userId}/albion</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
