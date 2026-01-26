import { Router } from "express";
import { verifyJWT, checkRole } from "../middlewares/auth.middleware";
import {
  getAllFiles,
  getPersonalHistory,
  getFileDetails,
  getFileByKey,
  updateFileRecord,
  deleteFileRecord,
  revokeFile,
} from "../controllers/file.controller";

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File management and sharing
 */

const router = Router();

// Apply verifyJWT to all file routes
router.use(verifyJWT);

// Sender Only Routes
/**
 * @swagger
 * /api/v1/files/history:
 *   get:
 *     summary: Get upload history of the current user (Sender only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History retrieved successfully
 */
router.route("/history").get(checkRole(["sender"]), getPersonalHistory);

/**
 * @swagger
 * /api/v1/files/revoke/{fileId}:
 *   patch:
 *     summary: Revoke access to a file (Sender only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File revoked
 */
router.route("/revoke/:fileId").patch(checkRole(["sender"]), revokeFile);

// Receiver Only Routes
/**
 * @swagger
 * /api/v1/files/all:
 *   get:
 *     summary: Get all available files for discovery (Receiver only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All files retrieved
 */
router.route("/all").get(checkRole(["receiver"]), getAllFiles);

// Key Access (Accessible by both roles, used by receivers to find a file by key)
/**
 * @swagger
 * /api/v1/files/key/{key}:
 *   get:
 *     summary: Get file details by share key
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Required if the file is password protected
 *     responses:
 *       200:
 *         description: File details retrieved
 *       401:
 *         description: Password required or invalid
 */
router.route("/key/:key").get(checkRole(["sender", "receiver"]), getFileByKey);

// Detail View, Update and Delete by ID
router
  .route("/:fileId")
  /**
   * @swagger
   * /api/v1/files/{fileId}:
   *   get:
   *     summary: Get file details by ID
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File details retrieved
   */
  .get(checkRole(["sender", "receiver"]), getFileDetails)
  /**
   * @swagger
   * /api/v1/files/{fileId}:
   *   patch:
   *     summary: Update file metadata (Sender only)
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               filename:
   *                 type: string
   *               description:
   *                 type: string
   *               category:
   *                 type: string
   *               expiry:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: File updated
   */
  .patch(checkRole(["sender"]), updateFileRecord)
  /**
   * @swagger
   * /api/v1/files/{fileId}:
   *   delete:
   *     summary: Delete a file and free storage (Sender only)
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File deleted
   */
  .delete(checkRole(["sender"]), deleteFileRecord);

export default router;
