import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../config/database.js";

const router = Router();

// Garante que a pasta uploads/products exista
const uploadProdDir = path.join(process.cwd(), "uploads", "products");
if (!fs.existsSync(uploadProdDir)) {
  fs.mkdirSync(uploadProdDir, { recursive: true });
}

// Configuração do multer para os produtos
const storageProd = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadProdDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProd = multer({ storage: storageProd });

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

// POST /api/products (Upload + Criação do Produto)
router.post("/", uploadProd.single("image"), async (req, res) => {
  try {
    const { categoryId, name, price, volume, packageType, unitCount } = req.body;
    
    if (!name || !price || !categoryId) {
      res.status(400).json({ error: "Nome, preço e categoria são obrigatórios." });
      return;
    }

    // Gera um slug baseado no nome e adiciona um sufixo aleatório para evitar conflitos no banco
    const baseSlug = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]+/g, '-')                      
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

    let imageUrl = null;
    if (req.file) {
      const host = req.protocol + '://' + req.get('host');
      imageUrl = `${host}/uploads/products/${req.file.filename}`;
    }

    const product = await prisma.product.create({
      data: {
        categoryId: parseInt(categoryId, 10),
        name,
        slug,
        price: parseFloat(String(price).replace(',', '.')),
        volume: volume ? parseInt(volume, 10) : null,
        packageType: packageType || null,
        unitCount: unitCount ? parseInt(unitCount, 10) : 1,
        imageUrl,
        isActive: true,
      },
      include: {
        category: true // Traz a categoria junto para renderizar corretamente no Admin.tsx
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Falha ao criar produto." });
  }
});

// PUT /api/products/:id (Atualização do Produto)
router.put("/:id", uploadProd.single("image"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID do produto inválido." });
      return;
    }

    const { categoryId, name, price, volume, packageType, unitCount } = req.body;

    const data: any = {};
    if (categoryId) data.categoryId = parseInt(categoryId, 10);
    if (name) data.name = name;
    if (price) data.price = parseFloat(String(price).replace(',', '.'));
    if (volume !== undefined) data.volume = volume ? parseInt(volume, 10) : null;
    if (packageType !== undefined) data.packageType = packageType || null;
    if (unitCount) data.unitCount = parseInt(unitCount, 10);

    if (req.file) {
      const host = req.protocol + '://' + req.get('host');
      data.imageUrl = `${host}/uploads/products/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Falha ao atualizar produto." });
  }
});

// DELETE /api/products/:id (Exclusão do Produto)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID do produto inválido." });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Falha ao excluir produto." });
  }
});

export default router;
