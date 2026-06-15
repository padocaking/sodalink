import { Router } from "express";
import { prisma } from "../config/database.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// GET /api/orders — List the authenticated user's orders
router.get("/", async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: { product: { select: { id: true, name: true, slug: true, imageUrl: true, unit: true } } },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error listing orders:", error);
    res.status(500).json({ error: "Failed to list orders" });
  }
});

// GET /api/orders/:orderNumber — Get a single order owned by the user
router.get("/:orderNumber", async (req: AuthRequest, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber: String(req.params.orderNumber), userId: req.userId },
      include: {
        orderItems: {
          include: { product: { select: { id: true, name: true, slug: true, imageUrl: true, unit: true } } },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: "Pedido não encontrado" });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /api/orders — Create an order from the cart (no payment step yet)
router.post("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: "Seu carrinho está vazio" });
      return;
    }

    const address = await prisma.address.findFirst({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });

    if (!address) {
      res.status(400).json({ error: "Nenhum endereço cadastrado para entrega" });
      return;
    }

    const subtotal = cartItems.reduce(
      (sum: number, item: (typeof cartItems)[number]) =>
        sum + Number(item.product.price) * item.quantity,
      0
    );

    const orderNumber = `${Date.now()}`.slice(-8);

    const order = await prisma.$transaction(async (tx: typeof prisma) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: address.id,
          status: "CONFIRMED",
          subtotal,
          total: subtotal,
          paymentMethod: "CREDIT_BALANCE",
          confirmedAt: new Date(),
          orderItems: {
            create: cartItems.map((item: (typeof cartItems)[number]) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: Number(item.product.price) * item.quantity,
            })),
          },
        },
        include: {
          orderItems: {
            include: { product: { select: { id: true, name: true, slug: true, imageUrl: true, unit: true } } },
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return created;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;