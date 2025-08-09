import { Router } from "express";
import { getProfile, getUsers, updateProfile, uploadAvatar } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { upload } from "../utils/upload";

const router = Router();

router.get("/", requireAuth, getUsers);
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.put("/avatar", requireAuth, upload.single("avatar"), uploadAvatar);

export default router;
