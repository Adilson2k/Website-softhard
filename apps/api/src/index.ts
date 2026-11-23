import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { blobRouter } from "./blob.js";
import { adminLeadsRouter, publicLeadsRouter } from "./leads.js";
import { adminPostsRouter, publicPostsRouter } from "./posts.js";
import { sessionRouter } from "./session.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN ?? "http://localhost:5174,http://localhost:3002")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(Object.assign(new Error("Origin is not allowed."), { status: 403 }));
  },
}));
app.use(express.json({ limit: "64kb" }));
app.use("/api/blob", express.raw({ type: ["image/jpeg", "image/png", "image/webp", "image/gif"], limit: "10mb" }), blobRouter);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    firebaseProjectConfigured: Boolean(process.env.FIREBASE_PROJECT_ID),
  });
});

const leadSubmissionLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "RATE_LIMITED", message: "Too many submissions. Try again later." },
});

app.use("/api/posts", publicPostsRouter);
app.use("/api/auth", sessionRouter);
app.use("/api/admin/posts", adminPostsRouter);
app.use("/api/leads", leadSubmissionLimit, publicLeadsRouter);
app.use("/api/admin/leads", adminLeadsRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "NOT_FOUND", message: "Route not found." });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const status = typeof error?.status === "number" ? error.status : error?.type === "entity.parse.failed" ? 400 : 500;
  if (status >= 500) console.error("Unhandled API error", error instanceof Error ? error.name : "unknown error");
  response.status(status).json({
    error: status === 400 ? "INVALID_JSON" : status === 403 ? "ORIGIN_NOT_ALLOWED" : "INTERNAL_ERROR",
    message: status === 400 ? "Request body must contain valid JSON." : status === 403 ? "This origin is not allowed." : "The request could not be completed.",
  });
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
