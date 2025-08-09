import { Router } from "express";
import * as BookController from "../controllers/book.controller";
import { upload } from "../utils/upload";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", BookController.listBooks);
router.post("/", requireAuth, upload.single("thumbnail"), BookController.createBook);
router.put("/:id", requireAuth, upload.single("thumbnail"), BookController.updateBook);
router.delete("/:id", requireAuth, BookController.deleteBook);

export default router;
