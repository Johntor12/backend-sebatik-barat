import { Request, Response } from "express"
import prisma from "../prisma/client";
import { esClient } from "../lib/elasticsearch";
import { error } from "console";

export const createNewsController = async (req: Request, res : Response) => {
    const { judul, isi, gambarUrl, author, desa } = req.body;
    
    const { username } = req.user!;

    try {
        if (!judul || !isi || !author || !desa) {
            return res.status(400).json({ error: "Data is not complete!" });
        }
        
        const validDesa = ["binalawan", "liangbunyu", "setabu", "enreukan"];
        if (!validDesa.includes(desa)) {
        return res.status(400).json({ error: "Desa tidak valid!" });
        }

        const newBerita = await prisma.berita.create({
            data: { judul, isi, gambarUrl, author, desa }
        })

        await esClient.index({
            index: 'berita',
            id: newBerita.beritaId.toString(),
            document: {
                judul: newBerita.judul,
                isi: newBerita.isi,
                desa: newBerita.desa,
                author: username,
                createdAt: newBerita.createdAt
            },
        });

        return res.status(201).json({ message : "Berita berhasil dibuat!", berita : newBerita})
    } catch (err) {
        return res.status(500).json({ message: "Gagal membuat berita. Coba lagi!", error : err});
    }
}

export const getNewsByNewsIdController = async (req: Request, res: Response) => {
    const { id } = req.params;

    const newsId = parseInt(id, 10);
    
    if (isNaN(newsId) || newsId <= 0) {
        return res.status(400).json({
            error: "News ID is not valid"
        })
    }

    try {
        const existingNews = await prisma.berita.findUnique({
            where : { beritaId : newsId }
        })

        if (!existingNews) {
            return res.status(404).json({
                error : "News is not found!"
            })
        }

        return res.status(200).json({
            message: "News is rendered successfully!",
            data: existingNews
        })
    } catch (err) {
        res.status(500).json({
            message: "Error while getting news!",
            err: err
        })
    }

}

export const searchNewsController = async (req: Request, res: Response) => {
    const keyword = String(req.query.keyword);

    if (!keyword) {
        return res.status(400).json({ message: "Keyword is Required" });
    }
    try {
        const result = await esClient.search({
            index: 'berita',
            query: {
                multi_match: {
                    query: keyword,
                    fields: ['judul', 'isi', 'author'],
                    fuzziness: 'AUTO'
                }
            }
        });

        const hits = result.hits.hits.map(hit => hit._source);
        res.status(200).json({ hits, message : "Search Successfull" });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching" });
  }
}

export const updateNewsByNewsIdController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { judul, isi, gambarUrl } = req.body;

    const newsId = parseInt(id, 10);

    if (isNaN(newsId) || newsId <= 0) {
        return res.status(400).json({
            error: "News ID is not valid"
        })
    }

    try {
        const existingNews = await prisma.berita.findUnique({
            where: { beritaId: newsId },
            include: {
                author: true,
            },
        })

        if (!existingNews) {
            return res.status(404).json({
                error: "News ID is not Found!"
            })
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized. Please sign in!"
            })
        }

        if (user.id != existingNews.authorId) {
            return res.status(403).json({
                message: "Only The News Author that can update this news."
            })
        }

        const updatedNews = await prisma.berita.update({
            where: { beritaId: newsId },
            data: {
                judul,
                isi,
                gambarUrl,
                updatedAt: new Date(),
            }
        })

        return res.status(200).json({message: "News is updated successfully!", data: updatedNews})
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error!"})
    }
}

export const searchNewsByAuthorOwnedController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const username = req.user?.username;
        if (!username) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const myNews = await prisma.berita.findMany({
            where: {
                authorId: userId,
            },
            include: {
                author: true  // <- Ini yang akan membawa data user terkait berita tersebut
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json(myNews);
    } catch (err) {
        console.error("Error fetching news:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export const deleteNewsByNewsAuthorController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const newsId = parseInt(req.params.id);

    try {
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized. Please sign in!",
            });
        }

        const berita = await prisma.berita.findUnique({
            where: {
                beritaId: newsId,
            },
        });

        if (!berita) {
            return res.status(404).json({
                message: "News is not found!"
            });
        }

        if (berita.authorId !== userId) {
            return res.status(403).json({
                message: "You don't have access to delete this news!",
            })
        }

        await prisma.berita.delete({
            where: {
                beritaId: newsId,
            },
        })

        return res.status(200).json({
            message: "News is deleted successfully!"
        })
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error!",
            err: err
        })
    }
}