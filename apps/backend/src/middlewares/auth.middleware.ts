import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { error } from "../utils/response";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies["accessToken"];
    if (!token) return res.status(401).json(error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    req.user = { id: Number(decoded.sub) } as any;
    next();
  } catch (err) {
    return res.status(401).json(error("Unauthorized"));
  }
}
