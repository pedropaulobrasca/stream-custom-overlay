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
    duration?: number;
    timer?: number;
    albionItem?: AlbionItem;
    customImage?: {
      url: string;
      filename: string;
    };
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

  // Execute action when clicked (standardized for all action types)
  const executeAction = async (action: Action) => {
    const timer = actionTimers[action.id];
    
    // Don't execute if already active (treat all types the same as press_key)
    if (timer?.isActive) {
      return; // Action already active or on cooldown
    }

    try {
      const response = await api.post(`/actions/${action.id}/execute`, {
        triggeredBy: "overlay_click",
      });

      console.log("Action executed from overlay:", response.data);

      // Create a manual execution event to show in overlay
      const manualEvent = {
        id: `manual_${Date.now()}`,
        actionId: action.id,
        actionName: action.name,
        username: "Manual",
        bits: 0, // 0 bits for manual execution
        timestamp: new Date(),
      };

      // Process this event to activate the timer
      processEvents([manualEvent]);

    } catch (error: any) {
      console.error("Failed to execute action from overlay:", error);
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
            // Standardize duration calculation for all action types (like press_key)
            let durationMs = 0;
            if (action.config.duration) {
              durationMs = action.config.duration * 1000; // Use seconds for all
            } else if (action.config.timer) {
              durationMs = action.config.timer * 1000; // Use seconds for all
            } else {
              durationMs = 5 * 1000; // Default 5 seconds for all
            }
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
      {/* Medieval Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-amber-300 text-xl font-bold tracking-wider drop-shadow-lg" 
             style={{ 
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(255,193,7,0.3)',
               fontFamily: 'serif' 
             }}>
          ⚔️ BITS ⚔️
        </div>
      </div>

      {/* Medieval Success Notifications */}
      {triggeredActions.length > 0 && (
        <div className="fixed top-4 right-4 space-y-3 z-50">
          {triggeredActions.map((action, index) => (
            <div
              key={`${action.id}-${action.triggeredAt.getTime()}`}
              className="relative bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-lg p-3 flex items-center gap-3 border-2 border-emerald-400 shadow-2xl"
              style={{
                animation: `medievalPulse 2s ease-in-out, slideInRight 0.5s ease-out`,
                animationDelay: `${index * 0.2}s`,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255,255,255,0.1)'
              }}
            >
              {/* Medieval frame for icon */}
              <div className="relative w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full p-0.5 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full overflow-hidden flex items-center justify-center">
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
                  <div className={`text-lg ${action.config.albionItem ? "hidden" : "block"}`}>
                    {action.config.emoji}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-bold truncate drop-shadow-md">
                  {action.name} ✓
                </div>
                <div className="text-emerald-200 text-xs font-semibold">
                  {action.bitsReceived} bits donated
                </div>
              </div>
              
              {/* Medieval corner decorations */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-amber-300"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-amber-300"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-amber-300"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-amber-300"></div>
            </div>
          ))}
        </div>
      )}

      {/* Clean Action Items - Image Only */}
      <div className="flex flex-col gap-4 max-w-[100px]">
        {actions
          .filter(action => action.config.customImage || action.config.albionItem) // Only show items with images
          .map((action) => {
          const isTriggered = triggeredActions.some(ta => ta.id === action.id);
          const timer = actionTimers[action.id];
          const isActive = timer?.isActive || false;
          const remainingSeconds = timer?.remainingSeconds || 0;
          // Treat all action types the same way as press_key
          const canExecute = !isActive;
          
          const hasCustomImage = action.config.customImage;
          const hasAlbionItem = action.config.albionItem;

          const formatTime = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
          };

          return (
            <div
              key={action.id}
              className={`relative flex flex-col items-center mt-4 ${canExecute ? "cursor-pointer" : ""}`}
              onClick={() => canExecute && executeAction(action)}
              style={{
                animation: isTriggered ? 'medievalGlow 2s ease-in-out' : '',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Pure Image - No Background */}
              <div className="relative">
                <div className={`w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                  canExecute ? 'hover:scale-105' : ''
                }`}>
                  {hasCustomImage ? (
                    <img
                      src={action.config.customImage!.url}
                      alt={action.name}
                      className="w-full h-full object-cover"
                    />
                  ) : hasAlbionItem && action.config.albionItem ? (
                    <img
                      src={getAlbionItemImageUrl(action.config.albionItem.uniqueName, action.config.albionItem.quality)}
                      alt={action.config.albionItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}

                  {/* Timer Overlay - Minimal */}
                  {isActive && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl">
                      <div className="text-white text-sm font-bold drop-shadow-lg">
                        {formatTime(remainingSeconds)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status indicator - Clean circle */}
                <div className={`absolute bottom-[13px] right-[12px] w-4 h-4 rounded-full shadow-lg transition-all duration-300 opacity-50 ${
                  isActive ? 'bg-red-500' : canExecute ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
              </div>

              {/* Bits count - Clean styling */}
              <div className="absolute -top-2 left-0 z-10">
                <div className="bg-amber-600 text-white text-sm font-bold px-2 py-1 rounded-lg shadow-lg">
                  {action.config.bitCost}
                </div>
              </div>

              {/* Timer info when active */}
              {isActive && timer?.triggeredBy && (
                <div className="mt-2 text-center">
                  <div className="text-red-400 text-xs font-medium drop-shadow-lg">
                    by {timer.triggeredBy}
                  </div>
                </div>
              )}

              {/* Progress Bar - Clean */}
              {isActive && (
                <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.max(0, (() => {
                        // Standardize all action types to use same duration calculation as press_key
                        if (action.config.duration) {
                          return (remainingSeconds / action.config.duration) * 100;
                        } else if (action.config.timer) {
                          return (remainingSeconds / action.config.timer) * 100;
                        } else {
                          return (remainingSeconds / 5) * 100; // Default 5 seconds
                        }
                      })())}%`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes medievalPulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          }
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes medievalGlow {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
          }
          50% { 
            filter: brightness(1.2) drop-shadow(0 0 16px rgba(16, 185, 129, 0.6));
          }
        }
      `}</style>

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
