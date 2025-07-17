import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { Request, Response, NextFunction } from "express";
// import { decrypt } from "dotenv";

interface JwtPayload {
  id: number;
  username: string;
  role: "admin" | "visitor";
}

export const requireSignInPassport = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['cookiesSebatik'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please login first.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
}

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["cookiesSebatik"];
  if (!token) return res.status(401).json({ message: "Token not found" });

  // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  const userId = req.user?.id;
  try {
    const user = await prisma.user.findUnique({
      where : { id: userId },
    });
    if (!user) {
      return res.status(401).json({ message: "User Not Found!" });
    }
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin resource. Access denied." });
    }

    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  next();
};
