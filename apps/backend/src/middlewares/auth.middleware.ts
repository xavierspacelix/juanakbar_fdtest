import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { error } from "../utils/response";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json(error("No token provided"));

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
    if (!decoded.sub) return res.status(401).json(error("Invalid token payload"));

    (req as any).user = { id: Number(decoded.sub) };
    next();
  } catch (err) {
    return res.status(401).json(error("Invalid token"));
  }
}
