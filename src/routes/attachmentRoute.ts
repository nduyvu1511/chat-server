import Express from "express"
import { uploadImage, uploadVideo } from "../config/upload"
import AttachmentController from "../controllers/AttachmentController"
import { paramsMiddleware, verifyToken } from "../middlewares"
import { checkAttachmentParamsExist } from "../middlewares/attachmentMiddleware"
import { attachmentIdSchema } from "../validators"
const router = Express.Router()

// router.post(
//   "/",
//   verifyToken,
//   bodyMiddleware(createAttachment),
//   AttachmentController.createAttachment
// )

/**
 * @openapi
 * '/api/attachment/image/single':
 *  post:
 *     tags:
 *      - Attachment
 *     summary: Upload 1 hình ảnh
 *     description: Sử dụng Multipart Requests formData, truyền name là image, chèn file có định dạng png, jpg, jpeg
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - filename
 *            properties:
 *              name:
 *                type: string
 *                enum: [image]
 *              filename:
 *                type: string
 *                format: binary
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
  "/image/single",
  verifyToken,
  uploadImage.single("image"),
  AttachmentController.uploadSingleImage
)

/**
 * @openapi
 * '/api/attachment/image/multiple':
 *  post:
 *     tags:
 *      - Attachment
 *     summary: Upload nhiều hình ảnh
 *     description: Sử dụng Multipart Requests formData, truyền name là images, chèn file có định dạng png, jpg, jpeg, tối đa 20 hình trên 1 lần gửi
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - filename
 *            properties:
 *              name:
 *                type: string
 *                enum: [images]
 *              filename:
 *                type: array
 *                items:
 *                  type: string
 *                  format: binary
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/AttachmentListRes'
 *       400:
 *         description: Bad Request
 */
router.post(
  "/image/multiple",
  verifyToken,
  uploadImage.array("images"),
  AttachmentController.uploadMultipleImage
)

/**
 * @openapi
 * '/api/attachment/video/single':
 *  post:
 *     tags:
 *      - Attachment
 *     summary: Upload 1 video
 *     description: Sử dụng Multipart Requests formData, truyền name là video có định dạng auto, flv, m3u8, ts, mov, mkv, mp4, mpd, ogv, webm
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - filename
 *            properties:
 *              name:
 *                type: string
 *                enum: [video]
 *              filename:
 *                type: array
 *                items:
 *                  type: string
 *                  format: binary
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
  "/video/single",
  verifyToken,
  uploadVideo.single("video"),
  AttachmentController.uploadSingleVideo
)

/**
 * @openapi
 * '/api/attachment/video/multiple':
 *  post:
 *     tags:
 *      - Attachment
 *     summary: Upload nhiều video
 *     description: Sử dụng Multipart Requests formData, truyền name là video có định dạng auto, flv, m3u8, ts, mov, mkv, mp4, mpd, ogv, webm, tối đa 10 video
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - filename
 *            properties:
 *              name:
 *                type: string
 *                enum: [videos]
 *              filename:
 *                type: array
 *                items:
 *                  type: string
 *                  format: binary
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
  "/video/multiple",
  verifyToken,
  uploadVideo.array("videos"),
  AttachmentController.uploadMultipleVideo
)

/**
 * @openapi
 * '/api/attachment/{attachment_id}':
 *  delete:
 *     tags:
 *      - Attachment
 *     summary: Xóa tài liệu
 *     parameters:
 *       - in: path
 *         name: attachment_id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *              error_code:
 *                type: number
 *              message:
 *                type: string
 *              success:
 *                type: boolean
 *              data:
 *                type: boolean
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/:attachment_id",
  verifyToken,
  paramsMiddleware(attachmentIdSchema),
  checkAttachmentParamsExist,
  AttachmentController.deleteAttachment
)

export default router
