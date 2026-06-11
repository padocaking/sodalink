import { Router } from "express";
import { prisma } from "../config/database.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// GET /api/favorites — List the authenticated user's favorite products
router.get("/", async (req: AuthRequest, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    res.json(favorites.map((f: (typeof favorites)[number]) => f.product));
  } catch (error) {
    console.error("Error listing favorites:", error);
    res.status(500).json({ error: "Failed to list favorites" });
  }
});

// PUT /api/favorites/:productId — Toggle favorite; returns { favorited }
router.put("/:productId", async (req: AuthRequest, res) => {
  try {
    const productId = Number(req.params.productId);
    const userId = req.userId!;

    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: "Produto inválido" });
      return;
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
      return;
    }

    await prisma.favorite.create({ data: { userId, productId } });
    res.json({ favorited: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

export default router;
