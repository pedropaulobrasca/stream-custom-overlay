import dotenv from "dotenv";
dotenv.config();

import { db, testDatabaseConnection } from "./connection";
import { users, actions, overlays } from "./schema";

async function seed(): Promise<void> {
  console.log("🌱 Starting database seeding...");

  try {
    // Test connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error("Could not connect to database");
    }

    // Clear existing data (be careful in production!)
    console.log("🧹 Cleaning existing data...");
    await db.delete(actions);
    await db.delete(overlays);
    await db.delete(users);

    // Seed sample data
    console.log("📦 Inserting sample data...");

    // Insert a sample user (this would normally be created during Twitch auth)
    const sampleUser = await db.insert(users).values({
      twitchId: "123456789",
      username: "samplestreamer",
      displayName: "Sample Streamer",
      profileImage: "https://via.placeholder.com/150",
      email: "sample@example.com",
    }).returning();

    console.log("👤 Created sample user:", sampleUser[0].username);

    // Insert sample actions
    const sampleActions = await db.insert(actions).values([
      {
        userId: sampleUser[0].id,
        name: "Welcome Sound",
        description: "Plays a welcome sound when someone follows",
        type: "sound",
        config: {
          soundUrl: "/sounds/welcome.mp3",
          volume: 0.8,
          trigger: "follow",
        },
      },
      {
        userId: sampleUser[0].id,
        name: "Donation Alert",
        description: "Shows an alert when someone donates",
        type: "text",
        config: {
          text: "Thank you {username} for the donation!",
          duration: 5000,
          trigger: "donation",
        },
      },
    ]).returning();

    console.log("🎬 Created sample actions:", sampleActions.length);

    // Insert sample overlays
    const sampleOverlays = await db.insert(overlays).values([
      {
        userId: sampleUser[0].id,
        name: "Albion Online Overlay",
        description: "Shows player stats and recent kills",
        game: "albion-online",
        config: {
          position: { x: 10, y: 10 },
          size: { width: 300, height: 200 },
          showKills: true,
          showDeaths: false,
        },
      },
      {
        userId: sampleUser[0].id,
        name: "Chat Overlay",
        description: "Displays recent chat messages",
        game: "twitch-chat",
        config: {
          position: { x: 50, y: 50 },
          maxMessages: 10,
          fadeAfter: 30000,
        },
      },
    ]).returning();

    console.log("🎨 Created sample overlays:", sampleOverlays.length);

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seeding
seed();
