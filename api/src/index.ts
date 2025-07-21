import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import eventsRouter from "./routes/events";
import sseRouter from "./routes/sse";
import authRouter from "./routes/auth";
import twitchRouter from "./routes/twitch";
import webhooksRouter from "./routes/webhooks";
import actionsRouter from "./routes/actions";
import overlaysRouter from "./routes/overlays";
import { testDatabaseConnection } from "./database/connection";

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/overlay", (req, res) => {
  res.json({ message: "Stream overlay API endpoint" });
});

// Authentication API
app.use("/api/auth", authRouter);

// Twitch API
app.use("/api/twitch", twitchRouter);

// Events API
app.use("/api/events", eventsRouter);

// SSE API
app.use("/api/sse", sseRouter);

// Webhooks API
app.use("/api/webhooks", webhooksRouter);

// Actions API
app.use("/api/actions", actionsRouter);

// Overlays API
app.use("/api/overlays", overlaysRouter);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection on startup
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.warn("⚠️  Server started but database connection failed. Some features may not work.");
  }
});
