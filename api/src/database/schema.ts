import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users table - stores Twitch user data
export const users = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  twitchId: text('twitch_id').unique().notNull(),
  username: text('username').notNull(),
  displayName: text('display_name').notNull(),
  profileImage: text('profile_image'),
  email: text('email'),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User sessions table - for managing active sessions
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').unique().notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Actions table - stores user-defined actions
export const actions = pgTable('actions', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'sound', 'text', 'image', 'video', etc.
  config: jsonb('config').notNull(), // JSON configuration for the action
  isActive: boolean('is_active').default(true).notNull(),
  triggerCount: integer('trigger_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Overlays table - stores overlay configurations
export const overlays = pgTable('overlays', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  game: text('game'), // e.g., 'albion-online', 'twitch-chat', etc.
  config: jsonb('config').notNull(), // JSON configuration for the overlay
  isActive: boolean('is_active').default(true).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events table - stores system events and user interactions
export const events = pgTable('events', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'action_triggered', 'overlay_viewed', 'user_login', etc.
  source: text('source'), // 'twitch', 'overlay', 'api', etc.
  data: jsonb('data'), // Event-specific data
  metadata: jsonb('metadata'), // Additional metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Twitch integrations table - stores Twitch-specific data
export const twitchIntegrations = pgTable('twitch_integrations', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  scopes: text('scopes').array(), // Array of granted scopes
  webhookSubscriptions: jsonb('webhook_subscriptions'), // Active webhook subscriptions
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for TypeScript inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;

export type Overlay = typeof overlays.$inferSelect;
export type NewOverlay = typeof overlays.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type TwitchIntegration = typeof twitchIntegrations.$inferSelect;
export type NewTwitchIntegration = typeof twitchIntegrations.$inferInsert;