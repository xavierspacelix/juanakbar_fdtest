import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import * as PasswordController from "../controllers/password.controller";

const router = Router();
router.post("/register", AuthController.register);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

router.post("/forgot-password", PasswordController.forgotPassword);
router.post("/reset-password", PasswordController.resetPassword);

export default router;
