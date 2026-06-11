import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  userId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);
    const sub = typeof payload === "string" ? NaN : Number(payload.sub);

    if (!Number.isInteger(sub)) {
      res.status(401).json({ error: "Sessão inválida ou expirada" });
      return;
    }

    req.userId = sub;
    next();
  } catch {
    res.status(401).json({ error: "Sessão inválida ou expirada" });
  }
}
