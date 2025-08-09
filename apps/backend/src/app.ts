import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/auth.routes";
import bookRoutes from "./routes/book.routes";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.APP_FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "FD Test API", version: "1.0.0" },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
export default app;
