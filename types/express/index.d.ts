import { Role } from "@prisma/client";
import Express from "express";

export { };

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number;
        username: string;
        role: Role;
      };
    }
  }
}
