import { Router } from "express";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../utils/upload";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

export default router;
