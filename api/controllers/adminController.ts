import { Request, Response } from "express";
import prisma from "../prisma/client"
import { NamaDesa } from "@prisma/client";

export const getAllNews = async (req: Request, res: Response) => {
    try {
        const allNews = await prisma.berita.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            count: allNews.length,
            data: allNews
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error!"
        })
    }
}

export const getAllNewsByDesaId = async (req: Request, res: Response) => {
    const { desa } = req.params;

    try {
        const allowedDesa = ["binalawan", "liangbunyu", "setabu", "enreukan"];
        if (!allowedDesa.includes(desa)) {
            return res.status(400).json({
                error: "Nama desa tidak valid!"
            })
        }

        const newsSelected = await prisma.berita.findMany({
            where: {
                desa: desa as NamaDesa,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            count: newsSelected.length,
            data: newsSelected
        })
    } catch (error) {
        console.error("Error fetching news by desa:", error);
        return res.status(500).json({
            success: false,
            error: "Gagal mengambil data berita berdasarkan desa",
        });
    }
}

export const deleteNewsByNewsId = async (req: Request, res: Response) => {
    const { id } = req.params;

    const newsId = parseInt(id, 10);
    if (isNaN(newsId) || newsId <= 0) {
        return res.status(400).json({ message: "News ID is not valid." });
    }

    try {
        const existingNews = await prisma.berita.findUnique({
            where: { beritaId: newsId },
            
        })
        if (!existingNews) {
            return res.status(404).json({
                error: "News is Not Found."
            })
        }

        const loggedInUser = req.user;

        if (!loggedInUser) {
        return res.status(401).json({ message: "Unauthorized" });
        }

        const admin = await prisma.admin.findUnique({
            where: { userId: loggedInUser.id },
        });

        const isAdmin = loggedInUser.role === "admin" && admin?.desa === existingNews?.desa;
        const isAuthor = loggedInUser.id === existingNews?.authorId && admin?.desa === existingNews.desa;

        if (!isAdmin && !isAuthor) {
            return res.status(403).json({
            message: "Hanya admin atau penulis dari desa yang sama yang boleh menghapus berita ini.",
        });
    }

        await prisma.berita.delete({
            where: {
                beritaId: newsId
             }
        })

        return res.status(200).json({
            message: "Delete News Successfully!"
        })
    } catch (err) {
        return res.status(500).json({
            err: "Internal Server Error. Delete News Unsuccessfully!"
        })
    }
}

export const deleteRuleController = async (req: Request, res: Response) => {
    const { id } = req.params;

    const ruleId = parseInt(id, 10);
    try {

        const existingRule = await prisma.peraturan.findUnique({
            where: { peraturanId : ruleId}
        })
        
        if (!existingRule) {
            return res.status(404).json({
                message: "Peraturan tidak ditemukan!"
            })
        }

        await prisma.peraturan.delete({
            where: { peraturanId: ruleId }
        })
        return res.status(200).json({
            message: "Delete Rule is Complete!"
        })
    } catch (err) {
        
    }
}

// export const 