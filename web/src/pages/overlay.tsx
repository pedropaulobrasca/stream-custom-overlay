import React, { useState, useEffect } from "react";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { useParams } from "react-router-dom";

interface AlbionItem {
  uniqueName: string;
  name: string;
  imageUrl: string;
}

interface Action {
  id: string;
  name: string;
  description: string;
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
          const actionsResponse = await fetch(`/api/overlays/public/${overlayId}/actions`);
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

          if (action && event.bits >= action.config.bitCost) {
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
            const endsAt = new Date(activatedAt.getTime() + (action.config.duration * 60 * 1000));
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
      <div className="flex items-center justify-between mb-4">
        <SparklesText className="italic text-4xl text-white">
          Overaction
        </SparklesText>

        {/* Manual sync button for OBS */}
        {/* <button
          onClick={forceRefresh}
          className="bg-blue-600/80 hover:bg-blue-700/80 text-white px-3 py-1 rounded text-sm border border-blue-500/50"
        >
          🔄 Sync
        </button> */}
      </div>
      {triggeredActions.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {triggeredActions.map((action, index) => (
            <div
              key={`${action.id}-${action.triggeredAt.getTime()}`}
              className="bg-green-600/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 border border-green-500/50 shadow-lg animate-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: "2s",
              }}
            >
              <div className="bg-green-700/50 rounded-lg min-w-[64px] h-16 overflow-hidden flex items-center justify-center">
                {action.config.albionItem ? (
                  <img 
                    src={action.config.albionItem.imageUrl}
                    alt={action.config.albionItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const sibling = target.nextElementSibling as HTMLElement;
                      if (sibling) sibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className={`text-3xl ${action.config.albionItem ? 'hidden' : 'block'}`}>
                  {action.config.emoji}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">
                  {action.name} ACTIVATED!
                </div>
                <div className="text-green-200 text-xs truncate">
                  {action.bitsReceived} bits from {action.triggeredBy}
                </div>
              </div>
              <div className="bg-yellow-500/30 border border-yellow-400/50 rounded px-2 py-1 text-yellow-300 text-xs font-bold">
                ✨ {action.bitsReceived}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regular Actions List */}
      <div className="flex flex-col gap-3 max-w-xs">
        {actions.map((action) => {
          const isTriggered = triggeredActions.some(ta => ta.id === action.id);
          const timer = actionTimers[action.id];
          const isActive = timer?.isActive || false;
          const remainingSeconds = timer?.remainingSeconds || 0;
          const triggeredBy = timer?.triggeredBy || "";

          // Format remaining time as MM:SS
          const formatTime = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
          };

          return (
            <div
              key={action.id}
              className={`${
                isActive
                  ? "bg-red-800/40 border-red-500/50"
                  : isTriggered
                    ? "bg-green-800/40 border-green-500/50"
                    : "bg-gray-800/90 border-gray-700/50"
              } backdrop-blur-sm rounded-lg p-3 border shadow-lg transition-all duration-500 relative overflow-hidden`}
            >
              {/* Timer Background */}
              {isActive && (
                <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
              )}

              <div className="relative flex items-center gap-3">
                <div className={`${
                  isActive ? "bg-red-700/50" : isTriggered ? "bg-green-700/50" : "bg-gray-700/50"
                } rounded-lg min-w-[64px] h-16 overflow-hidden flex items-center justify-center transition-all duration-500`}>
                  {isActive ? (
                    <div className="text-4xl">🚫</div>
                  ) : action.config.albionItem ? (
                    <img 
                      src={action.config.albionItem.imageUrl}
                      alt={action.config.albionItem.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const sibling = target.nextElementSibling as HTMLElement;
                        if (sibling) sibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div className={`text-4xl ${isActive || !action.config.albionItem ? 'block' : 'hidden'}`}>
                    {isActive ? '' : action.config.emoji}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">
                    {action.name}
                    {isActive && (
                      <span className="ml-2 text-red-300 text-xs font-bold">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <div className="text-gray-300 text-xs truncate">
                    {isActive ? (
                      <span className="text-red-300">
                        Time left: {formatTime(remainingSeconds)} | by {triggeredBy}
                      </span>
                    ) : (
                      <span>
                        {action.description || "No description"} | Duration: {action.config.duration}min
                      </span>
                    )}
                  </div>
                  {/* Timer Bar */}
                  {isActive && (
                    <div className="mt-1 w-full bg-gray-700/50 rounded-full h-1">
                      <div
                        className="bg-red-400 h-1 rounded-full transition-all duration-1000 ease-out animate-pulse"
                        style={{
                          width: `${Math.max(0, (remainingSeconds / (action.config.duration * 60)) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className={`${
                  isActive
                    ? "bg-red-500/30 border-red-400/50 text-red-300"
                    : "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                } border rounded px-2 py-1 text-xs font-bold`}>
                  {isActive ? formatTime(remainingSeconds) : `${action.config.bitCost} bits`}
                </div>
              </div>

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
