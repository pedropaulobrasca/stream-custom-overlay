import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface TwitchEvent {
  type: 'CHEER' | 'CHANNEL_POINT_REDEMPTION' | 'FOLLOW' | 'SUBSCRIBE' | 'connected' | 'new_event' | 'CLEAR_EVENTS';
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
  timestamp?: string;
  event?: any;
}

export function useTwitchEvents() {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<TwitchEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setEvents([]);
      setIsConnected(false);
      return;
    }

    const eventSource = new EventSource(`/api/sse/${user.twitchId}`);

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: TwitchEvent = JSON.parse(event.data);
        console.log('Received SSE event:', data);

        if (data.type === 'connected') {
          setIsConnected(true);
        } else if (data.type === 'new_event') {
          setEvents((prev) => [data.event, ...prev.slice(0, 49)]);
        } else if (data.type === 'CLEAR_EVENTS') {
          setEvents([]);
        } else {
          setEvents((prev) => [data, ...prev.slice(0, 49)]);
        }
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [user, isAuthenticated]);

  const clearEvents = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/events/${user.twitchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to clear events:', error);
    }
  };

  return {
    events,
    isConnected,
    clearEvents,
  };
}