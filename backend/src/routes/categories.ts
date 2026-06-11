import { Router } from "express";
import { prisma } from "../config/database.js";

const router = Router();

// GET /api/categories — List active categories ordered by sortOrder
router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    res.json(
      categories.map(({ _count, ...c }: (typeof categories)[number]) => ({
        ...c,
        productCount: _count.products,
      }))
    );
  } catch (error) {
    console.error("Error listing categories:", error);
    res.status(500).json({ error: "Failed to list categories" });
  }
});

export default router;
