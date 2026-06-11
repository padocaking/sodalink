import { Router } from "express";
import { prisma } from "../config/database.js";

const router = Router();

// GET /api/products — List active products with optional filters
router.get("/", async (req, res) => {
  try {
    const { categoryId, categorySlug, search, featured } = req.query;

    const where: Record<string, unknown> = { isActive: true };

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (categorySlug) {
      where.category = { slug: String(categorySlug) };
    }

    if (search) {
      where.name = { contains: String(search) };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    res.json(products);
  } catch (error) {
    console.error("Error listing products:", error);
    res.status(500).json({ error: "Failed to list products" });
  }
});

// GET /api/products/:slug — Get product by slug
router.get("/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
