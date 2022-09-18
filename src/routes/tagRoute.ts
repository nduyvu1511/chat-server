import Express from "express"
import TagController from "../controllers/tagController"
import { bodyMiddleware, paramsMiddleware, queryMiddleware, verifyToken } from "../middlewares"
import {
  createTagMessageSchema,
  getTagMessageListSchema,
  tagIdParamsSchema,
  updateTagMessageSchema,
} from "../validators"
const router = Express.Router()

/**
 * @openapi
 * '/api/tag':
 *  get:
 *     tags:
 *      - Tag
 *     summary: Lấy danh sách tin nhắn nhanh
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/TagListRes'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/",
  queryMiddleware(getTagMessageListSchema),
  verifyToken,
  TagController.getTagMessageList
)
router.post(
  "/",
  bodyMiddleware(createTagMessageSchema),
  verifyToken,
  TagController.createTagMessage
)
router.put(
  "/:tag_id",
  paramsMiddleware(tagIdParamsSchema),
  queryMiddleware(updateTagMessageSchema),
  verifyToken,
  TagController.updateTagMessage
)
router.delete(
  "/:tag_id",
  paramsMiddleware(tagIdParamsSchema),
  verifyToken,
  TagController.deleteTagMessage
)

export default router
