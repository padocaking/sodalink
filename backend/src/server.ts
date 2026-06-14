import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import favoriteRoutes from "./routes/favorites.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

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
