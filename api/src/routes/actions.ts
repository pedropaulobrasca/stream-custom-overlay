import express from "express";
import { eq } from "drizzle-orm";
import { db } from "../database/connection";
import { actions, NewAction } from "../database/schema";
import { authenticateToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";
import { desktopWS } from "../services/desktop-ws";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all user actions
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userActions = await db
      .select()
      .from(actions)
      .where(eq(actions.userId, req.user!.userId))
      .orderBy(actions.createdAt);

    res.json(userActions);
  } catch (error) {
    console.error("Error fetching actions:", error);
    res.status(500).json({ error: "Failed to fetch actions" });
  }
});

// Get action by ID
router.get("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const action = await db
      .select()
      .from(actions)
      .where(eq(actions.id, id))
      .limit(1);

    if (!action[0] || action[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Action not found" });
    }

    res.json(action[0]);
  } catch (error) {
    console.error("Error fetching action:", error);
    res.status(500).json({ error: "Failed to fetch action" });
  }
});

// Create new action
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, type, config } = req.body;

    if (!name || !type || !config) {
      return res.status(400).json({ error: "Name, type, and config are required" });
    }

    const userId = req.user!.userId;

    // Create the action directly (no auto overlay creation)
    const newAction: NewAction = {
      userId,
      name,
      description,
      type,
      config,
      isActive: true,
    };

    const createdAction = await db.insert(actions).values(newAction).returning();

    res.status(201).json(createdAction[0]);
  } catch (error) {
    console.error("Error creating action:", error);
    res.status(500).json({ error: "Failed to create action" });
  }
});

// Update action
router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, config, isActive } = req.body;

    // Check if action exists and belongs to user
    const existingAction = await db
      .select()
      .from(actions)
      .where(eq(actions.id, id))
      .limit(1);

    if (!existingAction[0] || existingAction[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Action not found" });
    }

    const updateData: Partial<NewAction> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (config !== undefined) updateData.config = config;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedAction = await db
      .update(actions)
      .set(updateData)
      .where(eq(actions.id, id))
      .returning();

    res.json(updatedAction[0]);
  } catch (error) {
    console.error("Error updating action:", error);
    res.status(500).json({ error: "Failed to update action" });
  }
});

// Toggle action status
router.patch("/:id/toggle", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if action exists and belongs to user
    const existingAction = await db
      .select()
      .from(actions)
      .where(eq(actions.id, id))
      .limit(1);

    if (!existingAction[0] || existingAction[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Action not found" });
    }

    const updatedAction = await db
      .update(actions)
      .set({
        isActive: !existingAction[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(actions.id, id))
      .returning();

    res.json(updatedAction[0]);
  } catch (error) {
    console.error("Error toggling action:", error);
    res.status(500).json({ error: "Failed to toggle action" });
  }
});

// Delete action
router.delete("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if action exists and belongs to user
    const existingAction = await db
      .select()
      .from(actions)
      .where(eq(actions.id, id))
      .limit(1);

    if (!existingAction[0] || existingAction[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Action not found" });
    }

    await db.delete(actions).where(eq(actions.id, id));

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting action:", error);
    res.status(500).json({ error: "Failed to delete action" });
  }
});

// Execute action (send punishment to desktop app)
router.post("/:id/execute", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { triggeredBy } = req.body;

    // Check if action exists and belongs to user
    const existingAction = await db
      .select()
      .from(actions)
      .where(eq(actions.id, id))
      .limit(1);

    if (!existingAction[0] || existingAction[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Action not found" });
    }

    if (!existingAction[0].isActive) {
      return res.status(400).json({ error: "Action is not active" });
    }

    // Extract punishment details from action config
    const config = existingAction[0].config as any;

    // Generate punishment based on action type
    let punishmentType = "";
    let duration = 5000; // default 5 seconds

    switch (existingAction[0].type) {
    case "disable_skill": {
      // Map skill keys to punishment types
      const skillKey = config.skillKey || "e";
      punishmentType = `block_key_${skillKey.toLowerCase()}`;
      duration = (config.duration || 5) * 1000;
      break;
    }

    case "press_key": {
      // Map skill keys to press types
      const pressKey = config.skillKey || "e";
      punishmentType = `press_key_${pressKey.toLowerCase()}`;
      duration = 0; // Instant key press, no duration
      break;
    }

    default:
      return res.status(400).json({ error: "Unsupported action type for desktop execution" });
    }

    // Create punishment object
    const punishment = {
      id: `punishment_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      type: punishmentType,
      duration: duration,
      triggeredBy: triggeredBy || "manual",
    };

    // Send punishment to desktop clients
    desktopWS.sendPunishment(punishment);

    // Schedule punishment end notification
    if (duration > 0) {
      globalThis.setTimeout(() => {
        desktopWS.sendPunishmentEnd(punishment.id);
      }, duration);
    }

    console.log(`Executed action ${existingAction[0].name} - Punishment:`, punishment);

    res.json({
      success: true,
      punishment,
      action: existingAction[0],
      desktopClientsNotified: desktopWS.getAuthenticatedClientsCount(),
    });

  } catch (error) {
    console.error("Error executing action:", error);
    res.status(500).json({ error: "Failed to execute action" });
  }
});

export default router;
