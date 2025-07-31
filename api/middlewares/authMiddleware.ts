import jwt, {JwtPayload} from "jsonwebtoken";
import prisma from "../prisma/client";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/auth";
// import { decrypt } from "dotenv";

interface CustomJWTPayload extends JwtPayload {
  id: number;
  username: string;
  role: string;
}

// export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(" ")[1];

//   if (!token) return res.status(401).json({ message: "Token tidak ditemukan!" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
//     const user = await prisma.user.findUnique({ where: { id: decoded.id } });

//     if (!user || !user.role) {
//       return res.status(401).json({ message: "User tidak ditemukan atau role belum di-set!" });
//     }

//     // Pastikan role sesuai dengan tipe yang diharapkan
//     if (user.role !== "admin" && user.role !== "visitor") {
//       return res.status(403).json({ message: "Role tidak valid!" });
//     }

//     req.user = { id: user.id, username: user.username, role: user.role };
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Token tidak valid!", error: err });
//   }
// };

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
  console.log('Token received:', token);

  if (!token) return res.status(401).json({ message: "Token not found" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded?.id || !decoded?.username || !decoded?.role) {
      return res.status(403).json({ message: "Token tidak memiliki payload yang lengkap!" });
    }


    // Tambahkan ini agar req.user terisi

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: "User Not Found!" });
    }

    req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

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
