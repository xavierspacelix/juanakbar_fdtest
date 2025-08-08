import { Router } from "express";
import * as BookController from "../controllers/book.controller";
import { upload } from "../utils/upload";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", BookController.listBooks);
router.post("/", authMiddleware, upload.single("thumbnail"), BookController.createBook);

export default router;
