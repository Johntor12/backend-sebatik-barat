import { Request, Response } from "express";
import { NamaDesa } from "@prisma/client";
import prisma from "../prisma/client";
import { esClient } from "../lib/elasticsearch";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Multer setup untuk handle upload
const upload = multer({ dest: "uploads/" });

export const uploadToSupabase = async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            error: "File is required!"
        })
    }

    if (path.extname(file.originalname).toLowerCase() !== "pdf") {
        fs.unlinkSync(file.path);
        return res.status(400).json({
            error: "Only pdf files are acceptable!"
        })
    }

    const fileName = `${Date.now()}_${file.originalname}`;
    const fileBuffer = fs.readFileSync(file.path);

    const { data, error } = await supabase.storage
        .from("rule")
        .upload(`pdf${fileName}`, fileBuffer, {
            contentType: "application/pdf",
    });
    
    fs.unlinkSync(file.path);

    if (error) {
        return res.status(500).json({
            error: "Failed to upload pdf!",
            detail: error.message
        })
    }

    const { data: publicUrlData } = supabase.storage
        .from("rule")
        .getPublicUrl(`pdf/${fileName}`);

    return res.status(200).json({ fileUrl: publicUrlData.publicUrl });
}

export const uploadRuleMiddleware = upload.single("pdf");

export const createNewRuleController = async (req: Request, res: Response) => {
    const { judul, fileUrl, desa } = req.body;

    try {
        if (!judul || !fileUrl || !desa) {
            return res.status(400).json({message: "Data is not complete!"})
        }

        const validDesa = ["binalawan", "liangbunyu", "setabu", "enreukan"];
        if (!validDesa.includes(desa)) {
            return res.status(400).json({ error: "Desa tidak valid!" });
        }
        
        const newRule = await prisma.peraturan.create({
            data: {
                judul,
                fileUrl,
                desa: desa as NamaDesa
           }
        })

        await esClient.index({
            index: 'peraturan',
            id: newRule.peraturanId.toString(),
            document: {
                judul: newRule.judul,
                isi: newRule.fileUrl,
                desa: newRule.desa,
                createdAt: newRule.uploadedAt
            },
        });

        return res.status(201).json({
            message: "Rule berhasil dibuat!",
            data: newRule
        })
    } catch (err) {
        
    }
}

export const searchRuleController = async (req: Request, res: Response) => {
    const keyword = String(req.query.keyword);

    if (!keyword) {
        return res.status(400).json({ message: "Keyword is Required" });
    }

    try {
        const result = await esClient.search({
            index: 'rule',
            query: {
                multi_match: {
                    query: keyword,
                    fields: ['judul', 'isi'],
                    fuzziness: 'AUTO'
                }
            }
        })

        const hits = result.hits.hits.map(hit => hit._source);
        res.status(200).json({ hits, message : "Search Successfull" });
    } catch (err) {
        res.status(500).json({ error: "Error searching", err: err});
    }
}

export const getRuleByRuleIdController = async (req: Request, res: Response) => {
    const { id } = req.params;

    const ruleId = parseInt(id, 10);

    if (isNaN(ruleId) || ruleId <= 0) {
        return res.status(400).json({
            error: "News ID is not valid"
        })
    }

    try {
        const existingRule = await prisma.peraturan.findUnique({
            where: {
                peraturanId: ruleId
            }
        })

        if (!existingRule) {
            return res.status(404).json({
                message: "Rule is not found!"
            })
        }

        return res.status(200).json({
            message: "Rule is rendered successfully!",
            data: existingRule
        })

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            err: err
        })
    }
}

export const getRuleByDesaController = async (req: Request, res: Response) => {
    const { desa } = req.params;
    
    try {
        const allowedDesa = ["binalawan", "liangbunyu", "setabu", "enreukan"];
        if (!allowedDesa.includes(desa)) {
            return res.status(400).json({
                message: "Nama desa tidak valid!"
            })
        }
        
        const ruleSelected = await prisma.peraturan.findMany({
            where: { desa: desa as NamaDesa },
            orderBy: {
                uploadedAt: "desc",
            },
        })

        return res.status(200).json({
            success: true,
            count: ruleSelected.length,
            data: ruleSelected,
        })
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error!",
            err : err
        })
    }
}