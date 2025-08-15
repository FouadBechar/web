import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import { withCookies } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

// Security
app.use(helmet());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// CORS
const allowed = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000", "https://web-vert-one-ttcd1t450j.vercel.app"];

app.use(
  cors({
    origin: allowed,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Preflight for all routes
app.options("*", cors({
  origin: allowed,
  credentials: true
}));

// Cookies middleware
app.use(withCookies);

// Routes
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);

// Error handling
app.use(errorHandler);

export default app;
