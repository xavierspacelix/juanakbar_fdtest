import { Router } from "express";
import * as BookController from "../controllers/book.controller";
import { upload } from "../utils/upload";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", BookController.listBooks);
router.post("/", authMiddleware, upload.single("thumbnail"), BookController.createBook);
router.put("/:id", authMiddleware, upload.single("thumbnail"), BookController.updateBook);
router.delete("/:id", authMiddleware, BookController.deleteBook);

export default router;
