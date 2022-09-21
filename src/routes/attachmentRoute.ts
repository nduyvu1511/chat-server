import Express from "express"
import AttachmentController from "../controllers/AttachmentController"
import { bodyMiddleware, verifyToken } from "../middlewares"
import { createAttachment } from "../validators"
const router = Express.Router()
import fileUploader from "../config/cloudinary"

/**
 * @openapi
 * '/api/attachment':
 *  post:
 *     tags:
 *      - Attachment
 *     summary: Tạo một tệp tin mới
 *     description: Tệp tin có thể là ảnh, video, hoặc voice, ...
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/CreateAttachment'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/AttachmentRes'
 *       400:
 *         description: Bad Request
 */
router.post(
  "/",
  verifyToken,
  bodyMiddleware(createAttachment),
  AttachmentController.createAttachment
)

router.post(
  "/upload/single",
  verifyToken,
  fileUploader.single("image"),
  AttachmentController.uploadImage
)
router.post(
  "/upload/multiple",
  verifyToken,
  fileUploader.array("images"),
  AttachmentController.uploadImage
)

export default router
