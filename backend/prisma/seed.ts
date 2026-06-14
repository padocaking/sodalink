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
      data: { name: "Coca-cola", slug: "coca-cola", imageUrl: "http://localhost:3001/uploads/categories/coca-cola.png", sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: "Sabores", slug: "sabores", imageUrl: "http://localhost:3001/uploads/categories/sabores.png", sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: "Cervejas", slug: "cervejas", imageUrl: "http://localhost:3001/uploads/categories/cervejas.png", sortOrder: 3 },
    }),
    prisma.category.create({
      data: { name: "Cervejas Especiais", slug: "cervejas-especiais", imageUrl: "http://localhost:3001/uploads/categories/cervejas_especiais.png", sortOrder: 4 },
    }),
    prisma.category.create({
      data: { name: "Águas", slug: "aguas", imageUrl: "http://localhost:3001/uploads/categories/aguas.png", sortOrder: 5 },
    }),
    prisma.category.create({
      data: { name: "Sucos", slug: "sucos", imageUrl: "http://localhost:3001/uploads/categories/sucos.png", sortOrder: 6 },
    }),
    prisma.category.create({
      data: { name: "Chás", slug: "chas", imageUrl: "http://localhost:3001/uploads/categories/chas.png", sortOrder: 7 },
    }),
    prisma.category.create({
      data: { name: "Monster", slug: "monster", imageUrl: "http://localhost:3001/uploads/categories/monster.png", sortOrder: 8 },
    }),
    prisma.category.create({
      data: { name: "Bebidas Esportivas", slug: "bebidas-esportivas", imageUrl: "http://localhost:3001/uploads/categories/bebidas_esportivas.png", sortOrder: 9 },
    }),
    prisma.category.create({
      data: { name: "Drinks Prontos", slug: "drinks-prontos", imageUrl: "http://localhost:3001/uploads/categories/drinks_prontos.png", sortOrder: 10 },
    }),
    prisma.category.create({
      data: { name: "Destilados", slug: "destilados", imageUrl: "http://localhost:3001/uploads/categories/destilados.png", sortOrder: 11 },
    }),
    prisma.category.create({
      data: { name: "Vinhos", slug: "vinhos", imageUrl: "http://localhost:3001/uploads/categories/vinhos.png", sortOrder: 12 },
    }),
    prisma.category.create({
      data: { name: "Balas e gomas", slug: "balas-e-gomas", imageUrl: "http://localhost:3001/uploads/categories/balas_e_gomas.png", sortOrder: 13 },
    }),
    prisma.category.create({
      data: { name: "Doces e cereais", slug: "doces-e-cereais", imageUrl: "http://localhost:3001/uploads/categories/doces_e_cereais.png", sortOrder: 14 },
    }),
    prisma.category.create({
      data: { name: "Salgadinhos", slug: "salgadinhos", imageUrl: "http://localhost:3001/uploads/categories/salgadinhos.png", sortOrder: 15 },
    }),
  ]);

  const [
    cocaCola,
    sabores,
    cervejas,
    cervejasEspeciais,
    aguasCategory,
    sucosCategory,
    chasCategory,
    monster,
    bebidasEsportivas,
    drinksProntos,
    destilados,
    vinhos,
    balasEGomas,
    docesECereais,
    salgadinhos
  ] = categories;

  // Compatibility aliases for the existing products defined below
  const refrigerantes = cocaCola;
  const aguas = aguasCategory;
  const sucos = sucosCategory;
  const chas = chasCategory;
  const energeticos = monster;
  const isotonicos = bebidasEsportivas;

  console.log(`Categories created: ${categories.map((c) => c.name).join(", ")}`);

  // ─── Products (bebidas não alcoólicas) ───────────────────
  const products = await Promise.all([
    // Refrigerantes
    prisma.product.create({
    data: {
      categoryId: refrigerantes.id,
      name: "Coca-Cola Original 2L PET - Fardo c/ 6",
      slug: "coca-cola-original-2l-pet-fardo-6",
      description: "Refrigerante Coca-Cola Original 2L embalagem PET. Fardo com 6 unidades.",
      imageUrl: "http://localhost:3001/uploads/products/coca2l.png",
      price: 58.26,
      sku: "CC-ORIG-2L-PET-6",
      unit: "fardo",
      unitCount: 6,
      volume: 2000,
      packageType: "pet",
      stock: 100,
      minStock: 20,
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      },
    }),
    // 2
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 350ml Lata - Fardo c/ 12",
        slug: "coca-cola-original-350ml-lata-fardo-12",
        description: "Refrigerante Coca-Cola Original 350ml Lata. Fardo com 12 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca350.png",
        price: 39.60,
        sku: "CC-ORIG-350ML-LATA-12",
        unit: "fardo",
        unitCount: 12,
        volume: 350,
        packageType: "lata",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 2,
      },
    }),
    // 3
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 350ml Lata - Fardo c/ 6",
        slug: "coca-cola-zero-acucar-350ml-lata-fardo-6",
        description: "Refrigerante Coca-Cola Zero Açúcar 350ml Lata. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz350.png",
        price: 19.80,
        sku: "CC-ZERO-350ML-LATA-6",
        unit: "fardo",
        unitCount: 6,
        volume: 350,
        packageType: "lata",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 3,
      },
    }),
    // 4
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 2L PET - Fardo c/ 6",
        slug: "coca-cola-zero-acucar-2l-pet-fardo-6",
        description: "Refrigerante Coca-Cola Zero Açúcar 2L embalagem PET. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz2l.png",
        price: 58.26,
        sku: "CC-ZERO-2L-PET-6",
        unit: "fardo",
        unitCount: 6,
        volume: 2000,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 4,
      },
    }),
    // 5
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 200ml PET - Fardo c/ 12",
        slug: "coca-cola-original-200ml-pet-fardo-12",
        description: "Refrigerante Coca-Cola Original 200ml embalagem PET. Fardo com 12 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca200.png",
        price: 19.32,
        sku: "CC-ORIG-200ML-PET-12",
        unit: "fardo",
        unitCount: 12,
        volume: 200,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 5,
      },
    }),
    // 6
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 220ml Lata - Fardo c/ 6",
        slug: "coca-cola-original-220ml-lata-fardo-6",
        description: "Refrigerante Coca-Cola Original 220ml Lata. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca220.png",
        price: 12.54,
        sku: "CC-ORIG-220ML-LATA-6",
        unit: "fardo",
        unitCount: 6,
        volume: 220,
        packageType: "lata",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 6,
      },
    }),
    // 7
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 220ml Lata - Fardo c/ 12",
        slug: "coca-cola-original-220ml-lata-fardo-12",
        description: "Refrigerante Coca-Cola Original 220ml Lata. Fardo com 12 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca220b.png",
        price: 25.08,
        sku: "CC-ORIG-220ML-LATA-12",
        unit: "fardo",
        unitCount: 12,
        volume: 220,
        packageType: "lata",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 7,
      },
    }),
    // 8
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 250ml Garrafa - Fardo c/ 12",
        slug: "coca-cola-original-250ml-garrafa-fardo-12",
        description: "Refrigerante Coca-Cola Original 250ml Garrafa. Fardo com 12 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca250.png",
        price: 39.60,
        sku: "CC-ORIG-250ML-GARRAFA-12",
        unit: "fardo",
        unitCount: 12,
        volume: 250,
        packageType: "garrafa",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 8,
      },
    }),
    // 9
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 310ml Lata - Fardo c/ 6",
        slug: "coca-cola-original-310ml-lata-fardo-6",
        description: "Refrigerante Coca-Cola Original 310ml Lata. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca310.png",
        price: 19.80,
        sku: "CC-ORIG-310ML-LATA-6",
        unit: "fardo",
        unitCount: 6,
        volume: 310,
        packageType: "lata",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 9,
      },
    }),
    // 10
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 600ml PET - Fardo c/ 6",
        slug: "coca-cola-original-600ml-pet-fardo-6",
        description: "Refrigerante Coca-Cola Original 600ml embalagem PET. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca600.png",
        price: 25.20,
        sku: "CC-ORIG-600ML-PET-6",
        unit: "fardo",
        unitCount: 6,
        volume: 600,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 10,
      },
    }),
    // 11
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 1L PET - Fardo c/ 6",
        slug: "coca-cola-original-1l-pet-fardo-6",
        description: "Refrigerante Coca-Cola Original 1L embalagem PET. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca1l.png",
        price: 36.24,
        sku: "CC-ORIG-1L-PET-6",
        unit: "fardo",
        unitCount: 6,
        volume: 1000,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 11,
      },
    }),
    // 12
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 1.5L PET - Fardo c/ 6",
        slug: "coca-cola-original-1-5l-pet-fardo-6",
        description: "Refrigerante Coca-Cola Original 1.5L embalagem PET. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca15l.png",
        price: 50.70,
        sku: "CC-ORIG-1-5L-PET-6",
        unit: "fardo",
        unitCount: 6,
        volume: 1500,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 12,
      },
    }),
    // 13
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 2.5L PET - Fardo c/ 4",
        slug: "coca-cola-original-2-5l-pet-fardo-4",
        description: "Refrigerante Coca-Cola Original 2.5L embalagem PET. Fardo com 4 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca25l.png",
        price: 46.04,
        sku: "CC-ORIG-2-5L-PET-4",
        unit: "fardo",
        unitCount: 4,
        volume: 2500,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 13,
      },
    }),
    // 14
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Original 3L PET - Fardo c/ 3",
        slug: "coca-cola-original-3l-pet-fardo-3",
        description: "Refrigerante Coca-Cola Original 3L embalagem PET. Fardo com 3 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/coca3l.png",
        price: 50.76,
        sku: "CC-ORIG-3L-PET-3",
        unit: "fardo",
        unitCount: 3,
        volume: 3000,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 14,
      },
    }),
    // 15
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 200ml PET - Fardo c/ 12",
        slug: "coca-cola-zero-acucar-200ml-pet-fardo-12",
        description: "Refrigerante Coca-Cola Zero Açúcar 200ml embalagem PET. Fardo com 12 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz200.png",
        price: 19.32,
        sku: "CC-ZERO-200ML-PET-12",
        unit: "fardo",
        unitCount: 12,
        volume: 200,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 15,
      },
    }),
    // 16
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 220ml Lata - Fardo c/ 6",
        slug: "coca-cola-zero-acucar-220ml-lata-fardo-6",
        description: "Refrigerante Coca-Cola Zero Açúcar 220ml Lata. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz220.png",
        price: 12.54,
        sku: "CC-ZERO-220ML-LATA-6",
        unit: "fardo",
        unitCount: 6,
        volume: 220,
        packageType: "lata",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 16,
      },
    }),
    // 17
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 220ml Lata - Fardo c/ 12",
        slug: "coca-cola-zero-acucar-220ml-lata-fardo-12",
        description: "Refrigerante Coca-Cola Zero Açúcar 220ml Lata. Fardo com 12 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz220b.png",
        price: 25.08,
        sku: "CC-ZERO-220ML-LATA-12",
        unit: "fardo",
        unitCount: 12,
        volume: 220,
        packageType: "lata",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 17,
      },
    }),
    // 18
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 250ml Garrafa - Fardo c/ 12",
        slug: "coca-cola-zero-acucar-250ml-garrafa-fardo-12",
        description: "Refrigerante Coca-Cola Zero Açúcar 250ml Garrafa. Fardo com 12 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz250.png",
        price: 39.60,
        sku: "CC-ZERO-250ML-GARRAFA-12",
        unit: "fardo",
        unitCount: 12,
        volume: 250,
        packageType: "garrafa",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 18,
      },
    }),
    // 19
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 600ml PET - Fardo c/ 6",
        slug: "coca-cola-zero-acucar-600ml-pet-fardo-6",
        description: "Refrigerante Coca-Cola Zero Açúcar 600ml embalagem PET. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz600.png",
        price: 25.20,
        sku: "CC-ZERO-600ML-PET-6",
        unit: "fardo",
        unitCount: 6,
        volume: 600,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 19,
      },
    }),
    // 20
    prisma.product.create({
      data: {
        categoryId: refrigerantes.id,
        name: "Coca-Cola Zero Açúcar 1L PET - Fardo c/ 6",
        slug: "coca-cola-zero-acucar-1l-pet-fardo-6",
        description: "Refrigerante Coca-Cola Zero Açúcar 1L embalagem PET. Fardo com 6 unidades.",
        imageUrl: "http://localhost:3001/uploads/products/cocaz1l.png",
        price: 36.24,
        sku: "CC-ZERO-1L-PET-6",
        unit: "fardo",
        unitCount: 6,
        volume: 1000,
        packageType: "pet",
        stock: 100,
        minStock: 20,
        isActive: true,
        isFeatured: false,
        sortOrder: 20,
      },
    }),

    // Águas
    prisma.product.create({
      data: {
        categoryId: aguas.id,
        name: "Água Mineral 500ml",
        slug: "agua-mineral-500ml",
        description: "Água mineral sem gás 500ml",
        price: 2.50,
        sku: "AGU-001",
        unit: "un",
        stock: 500,
        minStock: 50,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: aguas.id,
        name: "Água Mineral 1,5L",
        slug: "agua-mineral-1-5l",
        description: "Água mineral sem gás 1,5 litros",
        price: 4.29,
        sku: "AGU-002",
        unit: "un",
        stock: 300,
        minStock: 40,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: aguas.id,
        name: "Água com Gás 500ml",
        slug: "agua-com-gas-500ml",
        description: "Água mineral com gás 500ml",
        price: 3.49,
        sku: "AGU-003",
        unit: "un",
        stock: 250,
        minStock: 30,
        sortOrder: 3,
      },
    }),

    // Sucos
    prisma.product.create({
      data: {
        categoryId: sucos.id,
        name: "Suco Del Valle Uva 1L",
        slug: "suco-del-valle-uva-1l",
        description: "Suco Del Valle sabor uva 1 litro",
        price: 8.99,
        comparePrice: 10.49,
        sku: "SUC-001",
        unit: "un",
        stock: 120,
        minStock: 15,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: sucos.id,
        name: "Suco Del Valle Laranja 1L",
        slug: "suco-del-valle-laranja-1l",
        description: "Suco Del Valle sabor laranja 1 litro",
        price: 8.99,
        sku: "SUC-002",
        unit: "un",
        stock: 110,
        minStock: 15,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: sucos.id,
        name: "Suco Natural One Laranja 900ml",
        slug: "suco-natural-one-laranja-900ml",
        description: "Suco Natural One 100% laranja 900ml",
        price: 14.90,
        sku: "SUC-003",
        unit: "un",
        stock: 60,
        minStock: 10,
        sortOrder: 3,
      },
    }),

    // Chás
    prisma.product.create({
      data: {
        categoryId: chas.id,
        name: "Chá Leão Pêssego 1,5L",
        slug: "cha-leao-pessego-1-5l",
        description: "Chá Leão sabor pêssego 1,5 litros",
        price: 7.49,
        sku: "CHA-001",
        unit: "un",
        stock: 100,
        minStock: 15,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: chas.id,
        name: "Chá Matte Leão Natural 1,5L",
        slug: "cha-matte-leao-natural-1-5l",
        description: "Chá Matte Leão natural 1,5 litros",
        price: 6.99,
        sku: "CHA-002",
        unit: "un",
        stock: 90,
        minStock: 15,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: chas.id,
        name: "Chá Gelado Feel Good Limão 1L",
        slug: "cha-gelado-feel-good-limao-1l",
        description: "Chá gelado Feel Good sabor limão 1 litro",
        price: 9.90,
        sku: "CHA-003",
        unit: "un",
        stock: 70,
        minStock: 10,
        sortOrder: 3,
      },
    }),

    // Energéticos
    prisma.product.create({
      data: {
        categoryId: energeticos.id,
        name: "Red Bull 250ml",
        slug: "red-bull-250ml",
        description: "Energético Red Bull lata 250ml",
        price: 9.99,
        comparePrice: 11.99,
        sku: "ENE-001",
        barcode: "9002490100070",
        unit: "un",
        stock: 200,
        minStock: 30,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: energeticos.id,
        name: "Monster Energy 473ml",
        slug: "monster-energy-473ml",
        description: "Energético Monster Energy lata 473ml",
        price: 8.49,
        sku: "ENE-002",
        barcode: "0070847811169",
        unit: "un",
        stock: 150,
        minStock: 20,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: energeticos.id,
        name: "TNT Energy 473ml",
        slug: "tnt-energy-473ml",
        description: "Energético TNT Energy lata 473ml",
        price: 5.99,
        sku: "ENE-003",
        unit: "un",
        stock: 180,
        minStock: 25,
        sortOrder: 3,
      },
    }),

    // Isotônicos
    prisma.product.create({
      data: {
        categoryId: isotonicos.id,
        name: "Gatorade Limão 500ml",
        slug: "gatorade-limao-500ml",
        description: "Isotônico Gatorade sabor limão 500ml",
        price: 6.49,
        sku: "ISO-001",
        unit: "un",
        stock: 140,
        minStock: 20,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: isotonicos.id,
        name: "Powerade Frutas 500ml",
        slug: "powerade-frutas-500ml",
        description: "Isotônico Powerade sabor frutas 500ml",
        price: 5.99,
        sku: "ISO-002",
        unit: "un",
        stock: 130,
        minStock: 20,
        sortOrder: 2,
      },
    }),
  ]);

  console.log(`Products created: ${products.length} items`);

  // ─── Orders (mirrors Order.tsx data) ─────────────────────

  // Order 1: Em andamento — R$ 1.398,50
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "40028922",
      userId: user.id,
      addressId: address.id,
      status: "CONFIRMED",
      subtotal: 1398.56,
      deliveryFee: 0,
      discount: 0,
      total: 1398.56,
      paymentMethod: "PIX",
      createdAt: new Date("2026-01-10T12:02:00"),
      confirmedAt: new Date("2026-01-10T12:05:00"),
      orderItems: {
        create: [
          { productId: products[0].id, quantity: 50, unitPrice: 10.99, totalPrice: 549.50 },  // Coca-Cola 2L
          { productId: products[1].id, quantity: 40, unitPrice: 8.49, totalPrice: 339.60 },   // Guaraná Antarctica 2L
          { productId: products[7].id, quantity: 30, unitPrice: 8.99, totalPrice: 269.70 },   // Suco Del Valle Uva
          { productId: products[13].id, quantity: 24, unitPrice: 9.99, totalPrice: 239.76 },  // Red Bull 250ml
        ],
      },
    },
  });

  // Order 2: Entregue — R$ 358,40
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "40028921",
      userId: user.id,
      addressId: address.id,
      status: "DELIVERED",
      subtotal: 358.13,
      deliveryFee: 0,
      discount: 0,
      total: 358.13,
      paymentMethod: "CREDIT_CARD",
      createdAt: new Date("2026-01-01T12:42:00"),
      confirmedAt: new Date("2026-01-01T13:00:00"),
      shippedAt: new Date("2026-01-02T08:00:00"),
      deliveredAt: new Date("2026-01-02T10:05:00"),
      orderItems: {
        create: [
          { productId: products[4].id, quantity: 50, unitPrice: 2.50, totalPrice: 125.00 },   // Água Mineral 500ml
          { productId: products[10].id, quantity: 20, unitPrice: 7.49, totalPrice: 149.80 },  // Chá Leão Pêssego
          { productId: products[16].id, quantity: 8, unitPrice: 6.49, totalPrice: 51.92 },    // Gatorade Limão
          { productId: products[6].id, quantity: 9, unitPrice: 3.49, totalPrice: 31.41 },     // Água com Gás
        ],
      },
    },
  });

  // Order 3: Cancelado — R$ 999,90
  const order3 = await prisma.order.create({
    data: {
      orderNumber: "40028920",
      userId: user.id,
      addressId: address.id,
      status: "CANCELLED",
      subtotal: 1000.88,
      deliveryFee: 0,
      discount: 0,
      total: 1000.88,
      paymentMethod: "BOLETO",
      createdAt: new Date("2026-01-01T12:32:00"),
      cancelledAt: new Date("2026-01-01T13:02:00"),
      orderItems: {
        create: [
          { productId: products[0].id, quantity: 30, unitPrice: 10.99, totalPrice: 329.70 },  // Coca-Cola 2L
          { productId: products[2].id, quantity: 30, unitPrice: 9.49, totalPrice: 284.70 },   // Fanta Laranja 2L
          { productId: products[14].id, quantity: 30, unitPrice: 8.49, totalPrice: 254.70 },  // Monster Energy
          { productId: products[15].id, quantity: 22, unitPrice: 5.99, totalPrice: 131.78 },  // TNT Energy
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
