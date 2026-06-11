import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login — Authenticate user with email and password
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Email ou senha inválidos" });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({ error: "Email ou senha inválidos" });
      return;
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        clientNumber: user.clientNumber,
        name: user.name,
        email: user.email,
        document: user.document,
        documentType: user.documentType,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Falha ao realizar login" });
  }
});

export default router;
