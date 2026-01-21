import { fileReceive, fileUpload } from "@/controllers/file.controller";
import { verifyJWT } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();

router.route("/upload").post(verifyJWT, fileUpload);
router.route("/retrieve").post(verifyJWT, fileReceive);

export default router;
