import { Router } from "express";
import { verifyUser } from "../middlewares/authMiddleware";
import { getUserDataController, updateUserDataController } from "../controllers/userController";

const router = Router();

router.get("/profile", verifyUser, getUserDataController);
router.put("/profile", verifyUser, updateUserDataController);


export default router;