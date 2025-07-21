import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Play, Zap } from "lucide-react";

interface Action {
  id: string;
  name: string;
  description: string;
  image: string;
  bitCost: number;
  enabled: boolean;
  durationMinutes: number;
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
  // Simulated user ID - same as overlays page
  const userId = "user_123abc";
  
  const [actions] = useState<Action[]>([
    {
      id: "1",
      name: "Block Wood Collection",
      description: "Block wood collection for duration",
      image: "🪓",
      bitCost: 139,
      enabled: true,
      durationMinutes: 10,
    },
    {
      id: "2",
      name: "Block Stone Collection", 
      description: "Block stone collection for duration",
      image: "⛏️",
      bitCost: 85,
      enabled: true,
      durationMinutes: 8,
    },
    {
      id: "3",
      name: "Block Ore Collection",
      description: "Block ore collection for duration", 
      image: "⚒️",
      bitCost: 13,
      enabled: true,
      durationMinutes: 3,
    },
    {
      id: "4",
      name: "Block Fiber Collection",
      description: "Block fiber collection for duration",
      image: "🌾", 
      bitCost: 65,
      enabled: true,
      durationMinutes: 6,
    },
    {
      id: "5",
      name: "Block Hide Collection",
      description: "Block hide resources for duration",
      image: "🦌",
      bitCost: 25,
      enabled: true,
      durationMinutes: 4,
    },
  ]);

  const [testEvents, setTestEvents] = useState<TestEvent[]>([]);
  const [testUsername, setTestUsername] = useState("TestUser123");
  const [customBits, setCustomBits] = useState<number | "">("");

  const triggerAction = async (action: Action, customBitAmount?: number) => {
    const bitsUsed = customBitAmount || action.bitCost;
    
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

    // Here you would normally send this event to the overlay via WebSocket or similar
    // For now, we'll just show a toast and store it locally
    toast.success(`🎉 ${action.name} triggered! ${bitsUsed} bits from ${testUsername}`);

    // Store in localStorage so overlay can potentially read it (simple demo)
    const overlayKey = `overlay_${userId}_events`;
    const existingEvents = JSON.parse(localStorage.getItem(overlayKey) || "[]");
    existingEvents.unshift(event);
    const updatedEvents = existingEvents.slice(0, 50);
    localStorage.setItem(overlayKey, JSON.stringify(updatedEvents));
    
    // Force storage event for cross-tab communication
    // Note: storage events don't fire in the same tab, so we trigger manually
    const storageEvent = new StorageEvent('storage', {
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
      const channel = new BroadcastChannel(`overlay_${userId}`);
      channel.postMessage({
        type: 'NEW_EVENT',
        event: event,
        allEvents: updatedEvents
      });
      channel.close();
      console.log("BroadcastChannel message sent");
    } catch (error) {
      console.log("BroadcastChannel not supported:", error);
    }
    
    // Also send to API for cross-platform communication (browser <-> OBS)
    try {
      const response = await fetch(`/api/events/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const customTrigger = (action: Action) => {
    const bits = typeof customBits === "number" ? customBits : action.bitCost;
    triggerAction(action, bits);
  };

  const clearEvents = async () => {
    const overlayKey = `overlay_${userId}_events`;
    
    // Clear localStorage
    localStorage.removeItem(overlayKey);
    
    // Clear API
    try {
      const response = await fetch(`/api/events/${userId}`, {
        method: 'DELETE',
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
    const storageEvent = new StorageEvent('storage', {
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
          <h1 className="text-2xl font-bold">Test Panel</h1>
          <p className="text-muted-foreground">
            Simulate bit donations to test overlay actions
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
        {actions.map((action) => (
          <Card key={action.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-2xl bg-muted rounded-lg p-2 min-w-[48px] h-12 flex items-center justify-center">
                  {action.image}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{action.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{action.bitCost} bits</Badge>
                    <Badge variant="outline">{action.durationMinutes}min</Badge>
                  </div>
                </div>
              </div>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => quickTrigger(action)}
                className="w-full"
                variant="default"
              >
                <Play className="w-4 h-4 mr-2" />
                Quick Test ({action.bitCost} bits)
              </Button>
              <Button 
                onClick={() => customTrigger(action)}
                className="w-full"
                variant="outline"
                disabled={!testUsername}
              >
                <Zap className="w-4 h-4 mr-2" />
                Custom Test ({typeof customBits === "number" ? customBits : action.bitCost} bits)
              </Button>
            </CardContent>
          </Card>
        ))}
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
            <p>• Overlay URL: <code>localhost:3000/overlay/{userId}/albion</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}