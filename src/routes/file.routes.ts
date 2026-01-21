import { fileUpload } from "@/controllers/file.controller";
import { verifyJWT } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();

router.route("/upload").post(verifyJWT, fileUpload);

export default router