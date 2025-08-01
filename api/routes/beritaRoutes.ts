import { Router } from "express";
import { isAdmin, verifyUser } from "../middlewares/authMiddleware";
import { createNewsController, deleteNewsByNewsAuthorController, getNewsByNewsIdController, searchNewsController, updateNewsByNewsIdController } from "../controllers/beritaController";
import { getAllNewsByDesaId } from "../controllers/adminController";
import { validateCreateNews, validateNewsInput } from "../helpers/valid";

const router = Router();

router.post('/new', verifyUser, isAdmin, validateCreateNews, createNewsController);
router.get('/berita/:beritaId', getNewsByNewsIdController);
router.get('/search', searchNewsController);
router.get('/desa/:desa', verifyUser, isAdmin, getAllNewsByDesaId);
router.put("/:id", verifyUser, validateNewsInput, updateNewsByNewsIdController);
router.delete("/:id", verifyUser, deleteNewsByNewsAuthorController);

export default router;