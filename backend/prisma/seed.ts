import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── User (mirrors User.tsx userData) ────────────────────
  const passwordHash = await bcrypt.hash("senha123", 10);

  const user = await prisma.user.upsert({
    where: { email: "contato@empresa.com.br" },
    update: {},
    create: {
      clientNumber: "319233674",
      name: "EMPRESA",
      email: "contato@empresa.com.br",
      passwordHash,
      document: "312.654.123-48",
      documentType: "CPF",
      phone: "+55 (41) 992702020",
      creditBalance: 0,
      language: "pt-BR",
    },
  });

  console.log(`User created: ${user.name} (${user.clientNumber})`);

  // ─── Address ─────────────────────────────────────────────
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: "Casa",
      street: "Rua XV de Novembro",
      number: "1200",
      complement: "Apto 301",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      zipCode: "80060-000",
      isDefault: true,
    },
  });

  console.log(`Address created: ${address.street}, ${address.number}`);

  // ─── Categories ──────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Bebidas", slug: "bebidas", sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: "Snacks", slug: "snacks", sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: "Limpeza", slug: "limpeza", sortOrder: 3 },
    }),
  ]);

  console.log(`Categories created: ${categories.map((c) => c.name).join(", ")}`);

  // ─── Products ────────────────────────────────────────────
  const products = await Promise.all([
    // Bebidas
    prisma.product.create({
      data: {
        categoryId: categories[0].id,
        name: "Coca-Cola 2L",
        slug: "coca-cola-2l",
        description: "Refrigerante Coca-Cola garrafa 2 litros",
        price: 10.99,
        comparePrice: 12.99,
        sku: "BEB-001",
        barcode: "7894900011517",
        unit: "un",
        stock: 150,
        minStock: 20,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: categories[0].id,
        name: "Guarana Antarctica 1L",
        slug: "guarana-antarctica-1l",
        description: "Refrigerante Guarana Antarctica garrafa 1 litro",
        price: 7.49,
        sku: "BEB-002",
        barcode: "7891991010856",
        unit: "un",
        stock: 200,
        minStock: 30,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: categories[0].id,
        name: "Agua Mineral 500ml",
        slug: "agua-mineral-500ml",
        description: "Agua mineral sem gas 500ml",
        price: 2.5,
        sku: "BEB-003",
        unit: "un",
        stock: 500,
        minStock: 50,
        sortOrder: 3,
      },
    }),
    // Snacks
    prisma.product.create({
      data: {
        categoryId: categories[1].id,
        name: "Doritos Original 96g",
        slug: "doritos-original-96g",
        description: "Salgadinho Doritos sabor original",
        price: 8.99,
        comparePrice: 10.49,
        sku: "SNK-001",
        unit: "un",
        stock: 80,
        minStock: 10,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: categories[1].id,
        name: "Amendoim Japonês 150g",
        slug: "amendoim-japones-150g",
        description: "Amendoim tipo japones torrado",
        price: 5.99,
        sku: "SNK-002",
        unit: "un",
        stock: 120,
        minStock: 15,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: categories[1].id,
        name: "Biscoito Cream Cracker 200g",
        slug: "biscoito-cream-cracker-200g",
        description: "Biscoito cream cracker tradicional",
        price: 4.29,
        sku: "SNK-003",
        unit: "un",
        stock: 90,
        minStock: 10,
        sortOrder: 3,
      },
    }),
    // Limpeza
    prisma.product.create({
      data: {
        categoryId: categories[2].id,
        name: "Detergente Ype 500ml",
        slug: "detergente-ype-500ml",
        description: "Detergente liquido Ype neutro",
        price: 2.79,
        sku: "LMP-001",
        unit: "un",
        stock: 200,
        minStock: 30,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: categories[2].id,
        name: "Agua Sanitaria 1L",
        slug: "agua-sanitaria-1l",
        description: "Agua sanitaria multiuso 1 litro",
        price: 4.99,
        sku: "LMP-002",
        unit: "un",
        stock: 150,
        minStock: 20,
        sortOrder: 2,
      },
    }),
  ]);

  console.log(`Products created: ${products.length} items`);

  // ─── Orders (mirrors Order.tsx data) ─────────────────────

  // Order 1: Em andamento — R$ 1.398,99
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "40028922",
      userId: user.id,
      addressId: address.id,
      status: "CONFIRMED",
      subtotal: 1398.99,
      deliveryFee: 0,
      discount: 0,
      total: 1398.99,
      paymentMethod: "PIX",
      createdAt: new Date("2026-01-10T12:02:00"),
      confirmedAt: new Date("2026-01-10T12:05:00"),
      orderItems: {
        create: [
          { productId: products[0].id, quantity: 50, unitPrice: 10.99, totalPrice: 549.5 },
          { productId: products[3].id, quantity: 50, unitPrice: 8.99, totalPrice: 449.5 },
          { productId: products[6].id, quantity: 100, unitPrice: 2.79, totalPrice: 279.0 },
          { productId: products[4].id, quantity: 20, unitPrice: 5.99, totalPrice: 119.8 },
        ],
      },
    },
  });

  // Order 2: Entregue — R$ 358,50
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "40028921",
      userId: user.id,
      addressId: address.id,
      status: "DELIVERED",
      subtotal: 358.5,
      deliveryFee: 0,
      discount: 0,
      total: 358.5,
      paymentMethod: "CREDIT_CARD",
      createdAt: new Date("2026-01-01T12:42:00"),
      confirmedAt: new Date("2026-01-01T13:00:00"),
      shippedAt: new Date("2026-01-02T08:00:00"),
      deliveredAt: new Date("2026-01-02T10:05:00"),
      orderItems: {
        create: [
          { productId: products[1].id, quantity: 20, unitPrice: 7.49, totalPrice: 149.8 },
          { productId: products[2].id, quantity: 50, unitPrice: 2.5, totalPrice: 125.0 },
          { productId: products[5].id, quantity: 15, unitPrice: 4.29, totalPrice: 64.35 },
          { productId: products[7].id, quantity: 4, unitPrice: 4.99, totalPrice: 19.96 },
        ],
      },
    },
  });

  // Order 3: Cancelado — R$ 999,99
  const order3 = await prisma.order.create({
    data: {
      orderNumber: "40028920",
      userId: user.id,
      addressId: address.id,
      status: "CANCELLED",
      subtotal: 999.99,
      deliveryFee: 0,
      discount: 0,
      total: 999.99,
      paymentMethod: "BOLETO",
      createdAt: new Date("2026-01-01T12:32:00"),
      cancelledAt: new Date("2026-01-01T13:02:00"),
      orderItems: {
        create: [
          { productId: products[0].id, quantity: 30, unitPrice: 10.99, totalPrice: 329.7 },
          { productId: products[3].id, quantity: 40, unitPrice: 8.99, totalPrice: 359.6 },
          { productId: products[6].id, quantity: 80, unitPrice: 2.79, totalPrice: 223.2 },
          { productId: products[1].id, quantity: 10, unitPrice: 7.49, totalPrice: 74.9 },
        ],
      },
    },
  });

  console.log(`Orders created: ${order1.orderNumber}, ${order2.orderNumber}, ${order3.orderNumber}`);

  // ─── Banners (mirrors BannerSlider.tsx) ──────────────────
  await Promise.all([
    prisma.banner.create({
      data: {
        title: "Slide 1",
        imageUrl: "/banners/slide-1.jpg",
        bgColor: "#3b82f6",
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: "Slide 2",
        imageUrl: "/banners/slide-2.jpg",
        bgColor: "#22c55e",
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: "Slide 3",
        imageUrl: "/banners/slide-3.jpg",
        bgColor: "#ef4444",
        sortOrder: 3,
        isActive: true,
      },
    }),
  ]);

  console.log("Banners created: 3 slides");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
