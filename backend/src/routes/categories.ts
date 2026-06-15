import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../config/database.js";

const router = Router();

// Garante que a pasta uploads/categories exista
const uploadDir = path.join(process.cwd(), "uploads", "categories");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para salvar as imagens em disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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

// POST /api/categories (Upload + Criação)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: "O nome da categoria é obrigatório." });
      return;
    }

    // Gera um slug simples baseado no nome (ex: "Sucos Naturais" vira "sucos-naturais")
    const slug = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]+/g, '-')                      
      .replace(/(^-|-$)+/g, '');                        

    let imageUrl = null;
    if (req.file) {
      // Monta a URL completa para a imagem salva (baseada no host da requisição)
      const host = req.protocol + '://' + req.get('host');
      imageUrl = `${host}/uploads/categories/${req.file.filename}`;
    }

    // Pega a categoria com o maior sortOrder atualmente
    const lastCategory = await prisma.category.findFirst({
      orderBy: { sortOrder: "desc" }
    });
    const nextSortOrder = (lastCategory?.sortOrder ?? 0) + 1;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        imageUrl,
        isActive: true,
        sortOrder: nextSortOrder
      }
    });

    res.status(201).json({ ...category, productCount: 0 });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Falha ao criar a categoria." });
  }
});

export default router;
