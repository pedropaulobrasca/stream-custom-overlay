import express from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../database/connection";
import { actions, overlays, NewAction, NewOverlay } from "../database/schema";
import { authenticateToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";

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

    // Start transaction to create action and overlay together
    const result = await db.transaction(async (tx) => {
      // Create the action
      const newAction: NewAction = {
        userId,
        name,
        description,
        type,
        config,
        isActive: true,
      };

      const createdAction = await tx.insert(actions).values(newAction).returning();

      // Check if Albion overlay already exists for this user
      const existingOverlay = await tx
        .select()
        .from(overlays)
        .where(and(
          eq(overlays.userId, userId),
          eq(overlays.game, "albion-online")
        ))
        .limit(1);

      let overlay;
      if (existingOverlay.length === 0) {
        // Create Albion overlay if it doesn't exist
        const newOverlay: NewOverlay = {
          userId,
          name: "Albion Online Overlay",
          description: "Overlay for Albion Online actions",
          game: "albion-online",
          config: {
            theme: "default",
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 },
            actions: [createdAction[0].id],
          },
          isActive: true,
        };

        overlay = await tx.insert(overlays).values(newOverlay).returning();
      } else {
        // Update existing overlay to include new action
        const currentConfig = existingOverlay[0].config as Record<string, any>;
        const updatedConfig = {
          ...currentConfig,
          actions: [...(currentConfig.actions || []), createdAction[0].id],
        };

        overlay = await tx
          .update(overlays)
          .set({
            config: updatedConfig,
            updatedAt: new Date(),
          })
          .where(eq(overlays.id, existingOverlay[0].id))
          .returning();
      }

      return { action: createdAction[0], overlay: overlay[0] };
    });

    res.status(201).json(result);
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

export default router;
