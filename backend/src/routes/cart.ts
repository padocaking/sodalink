import { Router } from "express";
import { prisma } from "../config/database.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

const cartInclude = {
  product: {
    include: { category: { select: { id: true, name: true, slug: true } } },
  },
} as const;

// GET /api/cart — List the authenticated user's cart items
router.get("/", async (req: AuthRequest, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
      include: cartInclude,
    });

    res.json(items);
  } catch (error) {
    console.error("Error listing cart:", error);
    res.status(500).json({ error: "Failed to list cart" });
  }
});

// PUT /api/cart/:productId — Set quantity (0 removes the item)
router.put("/:productId", async (req: AuthRequest, res) => {
  try {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body?.quantity);
    const userId = req.userId!;

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 0) {
      res.status(400).json({ error: "Produto ou quantidade inválidos" });
      return;
    }

    if (quantity === 0) {
      await prisma.cartItem.deleteMany({ where: { userId, productId } });
      res.json({ productId, quantity: 0 });
      return;
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity },
      create: { userId, productId, quantity },
      include: cartInclude,
    });

    res.json(item);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// DELETE /api/cart — Clear the cart
router.delete("/", async (req: AuthRequest, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.userId } });
    res.json({ cleared: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
