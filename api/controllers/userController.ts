import { Request, Response } from "express";
import prisma from "../prisma/client";

export const getUserDataController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (err) {

    }
}

export const updateUserDataController = async (req: Request, res: Response) => {
        try {
        const userId = req.user?.id;

        if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
        },
        });

        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}