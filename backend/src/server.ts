import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
