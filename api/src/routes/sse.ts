import express from "express";

const router = express.Router();

// Store SSE connections by userId
const connections: Record<string, Set<express.Response>> = {};

// SSE endpoint for real-time updates
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Initialize connections set if doesn't exist
  if (!connections[userId]) {
    connections[userId] = new Set();
  }

  // Add this connection
  connections[userId].add(res);
  console.log(`SSE connection established for user ${userId}. Total connections: ${connections[userId].size}`);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`);

  // Handle client disconnect
  req.on("close", () => {
    connections[userId]?.delete(res);
    console.log(`SSE connection closed for user ${userId}. Remaining connections: ${connections[userId]?.size || 0}`);

    // Clean up empty sets
    if (connections[userId]?.size === 0) {
      delete connections[userId];
    }
  });
});

// Function to broadcast event to all connections for a user
export const broadcastToUser = (userId: string, event: any): void => {
  const userConnections = connections[userId];
  if (userConnections && userConnections.size > 0) {
    console.log(`Broadcasting to ${userConnections.size} connections for user ${userId}`);

    const message = `data: ${JSON.stringify({ type: "new_event", event })}\n\n`;

    // Send to all connections for this user
    userConnections.forEach(res => {
      try {
        res.write(message);
      } catch (error) {
        console.error("Error sending SSE message:", error);
        userConnections.delete(res);
      }
    });
  } else {
    console.log(`No active SSE connections for user ${userId}`);
  }
};

export default router;
