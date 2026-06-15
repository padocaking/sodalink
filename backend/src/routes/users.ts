import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../config/database.js";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().min(1),
  documentType: z.enum(["CPF", "CNPJ"]),
  phone: z.string().min(1),
  creditBalance: z.coerce.number().min(0).optional(),
});

const userSelect = {
  id: true,
  clientNumber: true,
  name: true,
  email: true,
  document: true,
  documentType: true,
  phone: true,
  creditBalance: true,
  isActive: true,
  createdAt: true,
} as const;

// Gera um número de cliente único de 9 dígitos
async function generateClientNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(Math.floor(100000000 + Math.random() * 900000000));
    const existing = await prisma.user.findUnique({ where: { clientNumber: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Não foi possível gerar um número de cliente único.");
}

// GET /api/users — Lista usuários cadastrados
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: userSelect,
    });
    res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Falha ao listar usuários." });
  }
});

// POST /api/users — Cria um novo usuário
router.post("/", async (req, res) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos. Verifique nome, email, senha (mín. 6 caracteres), documento, tipo e telefone." });
      return;
    }

    const { name, email, password, document, documentType, phone, creditBalance } = parsed.data;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(409).json({ error: "Já existe um usuário com este email." });
      return;
    }

    const existingDocument = await prisma.user.findUnique({ where: { document } });
    if (existingDocument) {
      res.status(409).json({ error: "Já existe um usuário com este documento." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const clientNumber = await generateClientNumber();

    const user = await prisma.user.create({
      data: {
        clientNumber,
        name,
        email,
        passwordHash,
        document,
        documentType,
        phone,
        creditBalance: creditBalance ?? 0,
      },
      select: userSelect,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Falha ao criar usuário." });
  }
});

export default router;
