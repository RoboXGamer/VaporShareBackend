import { Router } from "express";
import { verifyJWT, checkRole } from "../middlewares/auth.middleware";
import {
  createFileRecord,
  getAllFiles,
  getPersonalHistory,
  getFileDetails,
} from "../controllers/file.controller";

const router = Router();

// Sender Rules
router.route("/").post(verifyJWT, checkRole(["sender"]), createFileRecord);

router
  .route("/history")
  .get(verifyJWT, checkRole(["sender"]), getPersonalHistory);

// Receiver Rules
router.route("/all").get(verifyJWT, checkRole(["receiver"]), getAllFiles);

// Detail View (Accessible by both for their respective needs)
router
  .route("/:fileId")
  .get(verifyJWT, checkRole(["sender", "receiver"]), getFileDetails);

export default router;
