import express from 'express';
import { broadcastToUser } from './sse';

const router = express.Router();

// In-memory storage for events (in production, use Redis or database)
const userEvents: Record<string, any[]> = {};

// Get events for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const events = userEvents[userId] || [];
  res.json({ events });
});

// Add event for a user
router.post('/:userId', (req, res) => {
  const { userId } = req.params;
  const event = req.body;
  
  if (!userEvents[userId]) {
    userEvents[userId] = [];
  }
  
  userEvents[userId].unshift(event);
  
  // Keep only last 50 events
  userEvents[userId] = userEvents[userId].slice(0, 50);
  
  // Broadcast to SSE connections
  broadcastToUser(userId, event);
  
  res.json({ success: true, totalEvents: userEvents[userId].length });
});

// Clear events for a user
router.delete('/:userId', (req, res) => {
  const { userId } = req.params;
  userEvents[userId] = [];
  
  // Broadcast clear event to SSE connections
  broadcastToUser(userId, { type: 'CLEAR_EVENTS' });
  
  res.json({ success: true });
});

export default router;