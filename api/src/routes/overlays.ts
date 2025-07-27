import express from "express";
import { eq, inArray, and } from "drizzle-orm";
import { db } from "../database/connection";
import { overlays, actions, NewOverlay } from "../database/schema";
import { authenticateToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";

const router = express.Router();

// Public route for overlay access (no auth required)
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Handle special "default" overlay case
    if (id === "default") {
      // Extract userId from query or path - for default overlay, we need to get it from the frontend
      // Since this is called from /overlay/:userId/default, we can parse the referrer or use a different approach
      // For now, let's create a virtual default overlay response
      const defaultOverlay = {
        id: "default",
        userId: "auto", // Will be handled by frontend
        name: "Default Stream Overlay",
        description: "Auto-generated overlay for stream actions",
        game: "stream",
        config: {
          theme: "default",
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
          actions: [], // Will be populated by actions endpoint
        },
        isActive: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return res.json(defaultOverlay);
    }

    const overlay = await db
      .select()
      .from(overlays)
      .where(eq(overlays.id, id))
      .limit(1);

    if (!overlay[0]) {
      return res.status(404).json({ error: "Overlay not found" });
    }

    res.json(overlay[0]);
  } catch (error) {
    console.error("Error fetching public overlay:", error);
    res.status(500).json({ error: "Failed to fetch overlay" });
  }
});

// Public route for overlay actions (no auth required)
router.get("/public/:id/actions", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Get userId from query parameter

    // Handle special "default" overlay case
    if (id === "default" && userId) {
      // Get all active actions for this user
      const userActions = await db
        .select()
        .from(actions)
        .where(and(
          eq(actions.userId, userId as string),
          eq(actions.isActive, true)
        ));

      return res.json(userActions);
    }

    // Get overlay first
    const overlay = await db
      .select()
      .from(overlays)
      .where(eq(overlays.id, id))
      .limit(1);

    if (!overlay[0]) {
      return res.status(404).json({ error: "Overlay not found" });
    }

    // Get actions from overlay config
    const config = overlay[0].config as any;
    if (config && config.actions && config.actions.length > 0) {
      const overlayActions = await db
        .select()
        .from(actions)
        .where(and(
          inArray(actions.id, config.actions),
          eq(actions.isActive, true)
        ));

      res.json(overlayActions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching overlay actions:", error);
    res.status(500).json({ error: "Failed to fetch overlay actions" });
  }
});

// All other routes require authentication
router.use(authenticateToken);

// Get all user overlays
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userOverlays = await db
      .select()
      .from(overlays)
      .where(eq(overlays.userId, req.user!.userId))
      .orderBy(overlays.createdAt);

    res.json(userOverlays);
  } catch (error) {
    console.error("Error fetching overlays:", error);
    res.status(500).json({ error: "Failed to fetch overlays" });
  }
});

// Get overlay by ID
router.get("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const overlay = await db
      .select()
      .from(overlays)
      .where(eq(overlays.id, id))
      .limit(1);

    if (!overlay[0] || overlay[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Overlay not found" });
    }

    res.json(overlay[0]);
  } catch (error) {
    console.error("Error fetching overlay:", error);
    res.status(500).json({ error: "Failed to fetch overlay" });
  }
});

// Create new overlay
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, game, config } = req.body;

    if (!name || !config) {
      return res.status(400).json({ error: "Name and config are required" });
    }

    const newOverlay: NewOverlay = {
      userId: req.user!.userId,
      name,
      description,
      game,
      config,
      isActive: true,
    };

    const createdOverlay = await db.insert(overlays).values(newOverlay).returning();

    res.status(201).json(createdOverlay[0]);
  } catch (error) {
    console.error("Error creating overlay:", error);
    res.status(500).json({ error: "Failed to create overlay" });
  }
});

// Update overlay
router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, game, config, isActive } = req.body;

    // Check if overlay exists and belongs to user
    const existingOverlay = await db
      .select()
      .from(overlays)
      .where(eq(overlays.id, id))
      .limit(1);

    if (!existingOverlay[0] || existingOverlay[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Overlay not found" });
    }

    const updateData: Partial<NewOverlay> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (game !== undefined) updateData.game = game;
    if (config !== undefined) updateData.config = config;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedOverlay = await db
      .update(overlays)
      .set(updateData)
      .where(eq(overlays.id, id))
      .returning();

    res.json(updatedOverlay[0]);
  } catch (error) {
    console.error("Error updating overlay:", error);
    res.status(500).json({ error: "Failed to update overlay" });
  }
});

// Toggle overlay status
router.patch("/:id/toggle", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if overlay exists and belongs to user
    const existingOverlay = await db
      .select()
      .from(overlays)
      .where(eq(overlays.id, id))
      .limit(1);

    if (!existingOverlay[0] || existingOverlay[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Overlay not found" });
    }

    const updatedOverlay = await db
      .update(overlays)
      .set({
        isActive: !existingOverlay[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(overlays.id, id))
      .returning();

    res.json(updatedOverlay[0]);
  } catch (error) {
    console.error("Error toggling overlay:", error);
    res.status(500).json({ error: "Failed to toggle overlay" });
  }
});

// Increment overlay view count
router.post("/:id/view", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if overlay exists and belongs to user
    const existingOverlay = await db
      .select()
      .from(overlays)
      .where(eq(overlays.id, id))
      .limit(1);

    if (!existingOverlay[0] || existingOverlay[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Overlay not found" });
    }

    const updatedOverlay = await db
      .update(overlays)
      .set({
        viewCount: existingOverlay[0].viewCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(overlays.id, id))
      .returning();

    res.json(updatedOverlay[0]);
  } catch (error) {
    console.error("Error incrementing overlay view count:", error);
    res.status(500).json({ error: "Failed to increment view count" });
  }
});

// Delete overlay
router.delete("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if overlay exists and belongs to user
    const existingOverlay = await db
      .select()
      .from(overlays)
      .where(eq(overlays.id, id))
      .limit(1);

    if (!existingOverlay[0] || existingOverlay[0].userId !== req.user!.userId) {
      return res.status(404).json({ error: "Overlay not found" });
    }

    await db.delete(overlays).where(eq(overlays.id, id));

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting overlay:", error);
    res.status(500).json({ error: "Failed to delete overlay" });
  }
});

export default router;
