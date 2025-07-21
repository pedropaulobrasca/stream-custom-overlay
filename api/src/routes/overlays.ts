import express from "express";
import { eq } from 'drizzle-orm';
import { db } from '../database/connection';
import { overlays, Overlay, NewOverlay } from '../database/schema';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';

const router = express.Router();

// All routes require authentication
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