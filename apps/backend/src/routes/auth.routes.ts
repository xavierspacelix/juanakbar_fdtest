import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";

const router = Router();
router.post("/register", AuthController.register);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

export default router;
