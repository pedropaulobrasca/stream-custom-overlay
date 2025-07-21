import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import eventsRouter from "./routes/events";
import sseRouter from "./routes/sse";

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

// Events API
app.use("/api/events", eventsRouter);

// SSE API
app.use("/api/sse", sseRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
