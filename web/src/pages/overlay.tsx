import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAlbionItemImageUrl } from "@/lib/albion-utils";
import { api } from "@/lib/api";



interface AlbionItem {
  uniqueName: string;
  name: string;
  quality: number;
  imageUrl: string;
}

interface Action {
  id: string;
  name: string;
  description: string;
  type: string;
  config: {
    emoji: string;
    bitCost: number;
    duration: number;
    albionItem?: AlbionItem;
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

interface TriggeredAction extends Action {
  triggeredBy: string;
  bitsReceived: number;
  triggeredAt: Date;
}

interface ActionTimer {
  actionId: string;
  isActive: boolean;
  activatedAt: Date | null;
  endsAt: Date | null;
  remainingSeconds: number;
  triggeredBy: string;
  bitsReceived: number;
}

export default function OverlayPage(): React.ReactElement {
  const { userId, overlayId } = useParams<{ userId: string; overlayId: string }>();
  const [actions, setActions] = useState<Action[]>([]);
  const [triggeredActions, setTriggeredActions] = useState<TriggeredAction[]>([]);
  const [, setRecentEvents] = useState<TestEvent[]>([]);
  const [actionTimers, setActionTimers] = useState<Record<string, ActionTimer>>({});

  // Execute keyboard action when clicked
  const executeKeyboardAction = async (action: Action) => {
    // Only execute if it's a keyboard action and not currently active (for blocking actions)
    if (!['disable_skill', 'disable_movement', 'disable_interaction', 'press_key'].includes(action.type)) {
      return;
    }

    const timer = actionTimers[action.id];
    // For blocking actions, don't execute if already active
    // For press_key actions, allow execution even if on cooldown
    if (timer?.isActive && ['disable_skill', 'disable_movement', 'disable_interaction'].includes(action.type)) {
      return; // Blocking action already active
    }

    try {
      const response = await api.post(`/actions/${action.id}/execute`, {
        triggeredBy: 'overlay_click'
      });
      
      console.log('Keyboard action executed from overlay:', response.data);

      // Create a manual execution event to show in overlay
      const manualEvent = {
        id: `manual_${Date.now()}`,
        actionId: action.id,
        actionName: action.name,
        username: 'Manual',
        bits: 0, // 0 bits for manual execution
        timestamp: new Date()
      };

      // Process this event to activate the timer
      processEvents([manualEvent]);

    } catch (error: any) {
      console.error('Failed to execute keyboard action from overlay:', error);
    }
  };

  // Fetch actions from API and overlay data
  useEffect(() => {
    const fetchActionsAndOverlay = async (): Promise<void> => {
      if (!userId || !overlayId) return;

      try {
        // Get specific overlay by ID (public route, no auth needed)
        const overlayResponse = await fetch(`/api/overlays/public/${overlayId}`);
        if (!overlayResponse.ok) {
          throw new Error("Failed to fetch overlay");
        }
        const overlay = await overlayResponse.json();

        if (overlay) {
          // Get actions for this overlay using the public route
          // For default overlay, pass userId as query parameter
          const actionsUrl = overlayId === "default" 
            ? `/api/overlays/public/${overlayId}/actions?userId=${userId}`
            : `/api/overlays/public/${overlayId}/actions`;
          
          const actionsResponse = await fetch(actionsUrl);
          if (!actionsResponse.ok) {
            throw new Error("Failed to fetch overlay actions");
          }
          const overlayActions = await actionsResponse.json();

          console.log("Loaded overlay actions:", overlayActions);
          setActions(overlayActions);

          // Initialize timers for each action
          const initialTimers: Record<string, ActionTimer> = {};
          overlayActions.forEach((action: any) => {
            initialTimers[action.id] = {
              actionId: action.id,
              isActive: false,
              activatedAt: null,
              endsAt: null,
              remainingSeconds: 0,
              triggeredBy: "",
              bitsReceived: 0,
            };
          });
          setActionTimers(initialTimers);
        } else {
          console.log("No overlay found or no actions in overlay:", overlayId);
          setActions([]);
        }
      } catch (error) {
        console.error("Error fetching overlay actions:", error);
        setActions([]);
      }
    };

    fetchActionsAndOverlay();
  }, [userId, overlayId]);

  // Function to process events (used by multiple sources)
  const processEvents = (events: any[]): void => {
    if (events.length > 0) {
      console.log("Processing events:", events);
      setRecentEvents(events.slice(0, 5));

      // Convert recent events to triggered actions
      const triggered = events.slice(0, 3).map((event: any) => {
        const action = actions.find(a => a.id === event.actionId);
        if (action) {
          return {
            ...action,
            triggeredBy: event.username,
            bitsReceived: event.bits,
            triggeredAt: new Date(event.timestamp),
          };
        }
        return null;
      }).filter((action): action is TriggeredAction => action !== null);

      console.log("Triggered actions:", triggered);
      setTriggeredActions(triggered);

      // Process events to activate timers
      setActionTimers(prev => {
        const updated = { ...prev };

        // Find the most recent activation for each action
        const latestActivations: Record<string, any> = {};

        events.forEach((event: any) => {
          const actionId = event.actionId;
          const action = actions.find(a => a.id === actionId);

          if (action && (event.bits >= action.config.bitCost || event.bits === 0)) {
            // Only keep the latest activation for each action
            if (!latestActivations[actionId] ||
                  new Date(event.timestamp) > new Date(latestActivations[actionId].timestamp)) {
              latestActivations[actionId] = event;
            }
          }
        });

        // Update timers based on latest activations
        Object.entries(latestActivations).forEach(([actionId, event]) => {
          const action = actions.find(a => a.id === actionId);
          if (action && updated[actionId]) {
            const activatedAt = new Date(event.timestamp);
            // Use seconds for keyboard actions, minutes for others
            const durationMs = ['disable_skill', 'disable_movement', 'disable_interaction', 'press_key'].includes(action.type) 
              ? action.config.duration * 1000 
              : action.config.duration * 60 * 1000;
            const endsAt = new Date(activatedAt.getTime() + durationMs);
            const now = new Date();
            const remainingMs = endsAt.getTime() - now.getTime();

            if (remainingMs > 0) {
              // Timer is still active
              updated[actionId] = {
                ...updated[actionId],
                isActive: true,
                activatedAt,
                endsAt,
                remainingSeconds: Math.ceil(remainingMs / 1000),
                triggeredBy: event.username,
                bitsReceived: event.bits,
              };
            } else {
              // Timer has expired
              updated[actionId] = {
                ...updated[actionId],
                isActive: false,
                activatedAt: null,
                endsAt: null,
                remainingSeconds: 0,
                triggeredBy: "",
                bitsReceived: 0,
              };
            }
          }
        });

        console.log("Updated timers:", updated);
        return updated;
      });
    }
  };

  // Setup SSE connection for real-time events
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up SSE connection for user:", userId);

    // Create SSE connection
    const eventSource = new EventSource(`/api/sse/${userId}`);

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE message received:", data);

        if (data.type === "new_event" && data.event) {
          // Process single new event
          const overlayKey = `overlay_${userId}_events`;
          const existingEvents = JSON.parse(localStorage.getItem(overlayKey) || "[]");
          existingEvents.unshift(data.event);
          localStorage.setItem(overlayKey, JSON.stringify(existingEvents.slice(0, 50)));

          // Process all events to update timers
          processEvents(existingEvents);
        } else if (data.event?.type === "CLEAR_EVENTS") {
          // Clear all events
          console.log("Clear events received via SSE");
          const overlayKey = `overlay_${userId}_events`;
          localStorage.removeItem(overlayKey);
          setRecentEvents([]);
          setTriggeredActions([]);
          setActionTimers(prev => {
            const cleared = { ...prev };
            Object.keys(cleared).forEach(actionId => {
              cleared[actionId] = {
                ...cleared[actionId],
                isActive: false,
                activatedAt: null,
                endsAt: null,
                remainingSeconds: 0,
                triggeredBy: "",
                bitsReceived: 0,
              };
            });
            return cleared;
          });
        }
      } catch (error) {
        console.error("Error processing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [userId, actions]);

  // Load existing events once on mount
  useEffect(() => {
    if (!userId) return;

    const loadExistingEvents = async (): Promise<void> => {
      console.log("Loading existing events on mount");

      // Try localStorage first
      const overlayKey = `overlay_${userId}_events`;
      const localEvents = JSON.parse(localStorage.getItem(overlayKey) || "[]");

      // Also try API as fallback
      let apiEvents: any[] = [];
      try {
        const response = await fetch(`/api/events/${userId}`);
        if (response.ok) {
          const data = await response.json();
          apiEvents = data.events || [];
        }
      } catch (error) {
        console.log("API not available, using localStorage only:", error);
      }

      // Use the source with more events
      const events = apiEvents.length > localEvents.length ? apiEvents : localEvents;

      if (events.length > 0) {
        console.log(`Loaded ${events.length} existing events from ${apiEvents.length > localEvents.length ? "API" : "localStorage"}`);
        processEvents(events);
      }
    };

    loadExistingEvents();
  }, [userId]); // Only run once when userId changes

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setActionTimers(prev => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.keys(updated).forEach(actionId => {
          const timer = updated[actionId];
          if (timer.isActive && timer.endsAt) {
            const now = new Date();
            const remainingMs = timer.endsAt.getTime() - now.getTime();

            if (remainingMs > 0) {
              const newRemainingSeconds = Math.ceil(remainingMs / 1000);
              if (newRemainingSeconds !== timer.remainingSeconds) {
                updated[actionId] = {
                  ...timer,
                  remainingSeconds: newRemainingSeconds,
                };
                hasChanges = true;
              }
            } else {
              // Timer expired
              updated[actionId] = {
                ...timer,
                isActive: false,
                activatedAt: null,
                endsAt: null,
                remainingSeconds: 0,
                triggeredBy: "",
                bitsReceived: 0,
              };
              hasChanges = true;
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide triggered actions (green notifications) after 5 seconds
  useEffect(() => {
    if (triggeredActions.length > 0) {
      const timer = setTimeout(() => {
        console.log("Auto-hiding triggered actions notifications");
        setTriggeredActions([]);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [triggeredActions]);

  if (!overlayId || !userId) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-xl">
          {!userId ? "User not specified" : "Overlay not specified"}
        </div>
      </div>
    );
  }

  // Commented out as it's not currently used
  // const forceRefresh = async (): Promise<void> => {
  //   console.log("Force refresh triggered");

  //   if (!userId) return;

  //   // Try localStorage first
  //   const overlayKey = `overlay_${userId}_events`;
  //   const localEvents = JSON.parse(localStorage.getItem(overlayKey) || "[]");

  //   // Also try API as fallback (useful for OBS)
  //   let apiEvents: any[] = [];
  //   try {
  //     const response = await fetch(`/api/events/${userId}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       apiEvents = data.events || [];
  //       console.log("Force refresh - API events fetched:", apiEvents.length);
  //     }
  //   } catch (error) {
  //     console.log("Force refresh - API not available:", error);
  //   }

  //   // Use API events if available and more recent than localStorage
  //   const events = apiEvents.length > localEvents.length ? apiEvents : localEvents;

  //   console.log("Force refresh - processing events:", {
  //     localCount: localEvents.length,
  //     apiCount: apiEvents.length,
  //     usingSource: apiEvents.length > localEvents.length ? "API" : "localStorage",
  //   });

  //   processEvents(events);
  // };

  return (
    <div className="min-h-screen bg-transparent p-4 flex justify-center flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white/60 text-lg font-light italic">
          Overaction
        </div>
      </div>
      {triggeredActions.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {triggeredActions.map((action, index) => (
            <div
              key={`${action.id}-${action.triggeredAt.getTime()}`}
              className="bg-green-600 rounded-lg p-2 flex items-center gap-2 animate-pulse border-2 border-green-400"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: "2s",
              }}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-green-700 flex items-center justify-center">
                {action.config.albionItem ? (
                  <img
                    src={getAlbionItemImageUrl(action.config.albionItem.uniqueName, action.config.albionItem.quality)}
                    alt={action.config.albionItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                      const sibling = target.nextElementSibling as HTMLElement;
                      if (sibling) sibling.style.display = "block";
                    }}
                  />
                ) : null}
                <div className={`text-sm ${action.config.albionItem ? "hidden" : "block"}`}>
                  {action.config.emoji}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold truncate">
                  {action.name} ✓
                </div>
                <div className="text-green-200 text-xs">
                  {action.bitsReceived} bits
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Minimal Floating Items */}
      <div className="flex flex-col gap-4 max-w-[120px]">
        {actions.map((action) => {
          const isTriggered = triggeredActions.some(ta => ta.id === action.id);
          const timer = actionTimers[action.id];
          const isActive = timer?.isActive || false;
          const remainingSeconds = timer?.remainingSeconds || 0;
          const isKeyboardAction = ['disable_skill', 'disable_movement', 'disable_interaction', 'press_key'].includes(action.type);
          const isBlockingAction = ['disable_skill', 'disable_movement', 'disable_interaction'].includes(action.type);
          const canExecute = isKeyboardAction && (!isActive || !isBlockingAction);

          // Format remaining time as MM:SS
          const formatTime = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
          };

          return (
            <div
              key={action.id}
              className={`relative flex flex-col items-center ${canExecute ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
              onClick={() => canExecute && executeKeyboardAction(action)}
            >
              {/* Main Item Image */}
              <div className={`${
                isActive ? "ring-4 ring-red-400 bg-red-800" :
                  isTriggered ? "ring-4 ring-green-400 bg-green-800" : 
                  canExecute ? "ring-2 ring-blue-400/50 bg-blue-900/20 hover:ring-blue-400" :
                  "ring-2 ring-white/20 bg-black/20"
              } w-16 h-16 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 relative group ${canExecute ? 'hover:scale-110' : ''}`}>
                {action.config.albionItem ? (
                  <img
                    src={getAlbionItemImageUrl(action.config.albionItem.uniqueName, action.config.albionItem.quality)}
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
                <div className={`w-full h-full flex items-center justify-center text-xl ${!action.config.albionItem ? "flex" : "hidden"}`}>
                  {action.config.emoji}
                </div>

                {/* Timer Overlay */}
                {isActive && (
                  <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center">
                    <div className="text-white text-xs font-bold">
                      {formatTime(remainingSeconds)}
                    </div>
                  </div>
                )}

                {/* Keyboard Action Indicator */}
                {canExecute && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    ⚡
                  </div>
                )}
              </div>

              {/* Compact Info */}
              <div className="mt-2 text-center">
                <div className="text-white text-xs font-bold truncate max-w-[100px] drop-shadow-lg">
                  {action.name}
                </div>
                {isActive && timer?.triggeredBy && (
                  <div className="text-red-300 text-xs font-medium">
                    by {timer.triggeredBy}
                  </div>
                )}
                {!isActive && (
                  <div className="text-yellow-400 text-xs font-bold">
                    {action.config.bitCost} bits
                  </div>
                )}
              </div>

              {/* Simple Timer Bar */}
              {isActive && (
                <div className="w-full h-1 bg-black/30 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-red-400 transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.max(0, (remainingSeconds / (isBlockingAction ? action.config.duration : action.config.duration * 60)) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Debug Info (remove in production) */}
      {/* <div className="fixed bottom-4 left-4 bg-black/90 text-white text-xs p-3 rounded max-w-sm space-y-1 max-h-96 overflow-y-auto">
        <div className="font-bold">Debug Info:</div>
        <div>User ID: {userId}</div>
        <div>Storage Key: overlay_{userId}_events</div>
        <div>Environment: {window.location.href.includes('localhost') ? 'Browser' : 'OBS/External'}</div>
        <div>Recent Events: {recentEvents.length}</div>
        <div>localStorage Available: {typeof(Storage) !== "undefined" ? "Yes" : "No"}</div>
        <div>BroadcastChannel Available: {typeof(BroadcastChannel) !== "undefined" ? "Yes" : "No"}</div>

        {recentEvents.length > 0 && (
          <div>Last: {recentEvents[0]?.actionName} by {recentEvents[0]?.username}</div>
        )}

        <div className="font-bold mt-2">Raw localStorage:</div>
        <div className="text-xs bg-gray-800 p-1 rounded">
          {localStorage.getItem(`overlay_${userId}_events`)?.slice(0, 100) || "empty"}...
        </div>

        <div className="font-bold mt-2">Timer State:</div>
        {Object.entries(actionTimers).map(([id, timer]) => (
          <div key={id} className="ml-2 text-xs">
            {id}: {timer.isActive ? `Active (${Math.floor(timer.remainingSeconds / 60)}:${(timer.remainingSeconds % 60).toString().padStart(2, '0')}) by ${timer.triggeredBy}` : "Inactive"}
          </div>
        ))}

        <button
          onClick={() => {
            const data = localStorage.getItem(`overlay_${userId}_events`);
            console.log("Manual localStorage check:", data);
            if (data) {
              const events = JSON.parse(data);
              console.log("Parsed events:", events);
            }
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs mt-2"
        >
          Check localStorage
        </button>
      </div> */}
    </div>
  );
}
