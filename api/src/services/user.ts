import { eq } from "drizzle-orm";
import { db } from "../database/connection";
import { users, userSessions, twitchIntegrations, User, NewUser } from "../database/schema";
import { TwitchUser } from "../types/auth";

export class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Find user by Twitch ID
  async findByTwitchId(twitchId: string): Promise<User | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.twitchId, twitchId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error finding user by Twitch ID:", error);
      throw error;
    }
  }

  // Create or update user from Twitch data
  async createOrUpdateFromTwitch(twitchUser: TwitchUser): Promise<User> {
    try {
      const existingUser = await this.findByTwitchId(twitchUser.id);

      if (existingUser) {
        // Update existing user
        const updatedUser = await db
          .update(users)
          .set({
            username: twitchUser.login,
            displayName: twitchUser.display_name,
            profileImage: twitchUser.profile_image_url,
            email: twitchUser.email || existingUser.email,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();

        return updatedUser[0];
      } else {
        // Create new user
        const newUser: NewUser = {
          twitchId: twitchUser.id,
          username: twitchUser.login,
          displayName: twitchUser.display_name,
          profileImage: twitchUser.profile_image_url,
          email: twitchUser.email,
          lastLoginAt: new Date(),
        };

        const createdUser = await db.insert(users).values(newUser).returning();
        return createdUser[0];
      }
    } catch (error) {
      console.error("Error creating/updating user from Twitch:", error);
      throw error;
    }
  }

  // Create user session
  async createSession(userId: string, token: string, refreshToken?: string, expiresAt?: Date): Promise<void> {
    try {
      await db.insert(userSessions).values({
        userId,
        token,
        refreshToken,
        expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
      });
    } catch (error) {
      console.error("Error creating user session:", error);
      throw error;
    }
  }

  // Store Twitch integration data
  async storeTwitchIntegration(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    scopes: string[],
  ): Promise<void> {
    try {
      // Check if integration exists
      const existing = await db
        .select()
        .from(twitchIntegrations)
        .where(eq(twitchIntegrations.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing integration
        await db
          .update(twitchIntegrations)
          .set({
            accessToken,
            refreshToken,
            expiresAt,
            scopes,
            updatedAt: new Date(),
          })
          .where(eq(twitchIntegrations.userId, userId));
      } else {
        // Create new integration
        await db.insert(twitchIntegrations).values({
          userId,
          accessToken,
          refreshToken,
          expiresAt,
          scopes,
        });
      }
    } catch (error) {
      console.error("Error storing Twitch integration:", error);
      throw error;
    }
  }

  // Get user by ID
  async findById(id: string): Promise<User | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  // Delete user session
  async deleteSession(token: string): Promise<void> {
    try {
      await db
        .delete(userSessions)
        .where(eq(userSessions.token, token));
    } catch (error) {
      console.error("Error deleting user session:", error);
      throw error;
    }
  }

  // Get user's Twitch integration
  async getTwitchIntegration(userId: string): Promise<any> {
    try {
      const result = await db
        .select()
        .from(twitchIntegrations)
        .where(eq(twitchIntegrations.userId, userId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error getting Twitch integration:", error);
      throw error;
    }
  }
}
