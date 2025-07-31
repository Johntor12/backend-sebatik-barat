import { Router } from 'express';
import { uploadToSupabase, uploadRuleMiddleware, createNewRuleController } from '../controllers/peraturanController';
import { isAdmin, verifyUser } from '../middlewares/authMiddleware';
import { getNewsByNewsIdController } from '../controllers/beritaController';
import { getAllNewsByDesaId } from '../controllers/adminController';

const router = Router();

router.post("/upload", verifyUser, isAdmin, uploadRuleMiddleware, uploadToSupabase, createNewRuleController);
router.get("/:id", verifyUser, getNewsByNewsIdController);
router.get(":/desa", verifyUser, isAdmin, getAllNewsByDesaId)

export default router;
