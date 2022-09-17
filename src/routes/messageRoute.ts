import Express from "express"
import MessageController from "../controllers/messageController"
import { bodyMiddleware, checkUserExist, paramsMiddleware, verifyToken } from "../middlewares"
import {
  messageIdSchema,
  readLastMessageSchema,
  readMessageSchema,
  SendMessageSchema,
} from "../validators"
const router = Express.Router()

/**
 * @openapi
 * '/api/v1/message/{message_id}/users_read':
 *  get:
 *     tags:
 *      - Message
 *     summary: Lấy danh sách những người đã đọc tin nhắn
 *     description: Lấy danh sách những người đã đọc tin nhắn, ngoại trừ người gọi request
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
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
 *           schema:
 *            $ref: '#/components/schema/UserListRes'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/:message_id/users_read",
  verifyToken,
  paramsMiddleware(messageIdSchema),
  MessageController.getUsersReadMessage
)

/**
 * @openapi
 * '/api/v1/message/read':
 *  patch:
 *     tags:
 *      - Message
 *     summary: Xác nhận đã đọc tin nhắn
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/MessageId'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message_id:
 *                  type: string
 *       400:
 *         description: Bad Request
 */
router.patch(
  "/read",
  verifyToken,
  bodyMiddleware(readMessageSchema),
  MessageController.confirmReadMessage
)

/**
 * @openapi
 * '/api/v1/message/read_all':
 *  patch:
 *     tags:
 *      - Message
 *     summary: Xác nhận đã đọc hết tin nhắn trong room chat
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/RoomId'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                room_id:
 *                  type: string
 *       400:
 *         description: Bad Request
 */
router.patch(
  "/read_all",
  verifyToken,
  bodyMiddleware(readLastMessageSchema),
  MessageController.confirmReadAllMessageInRoom
)

/**
 * @openapi
 * '/api/v1/message':
 *  post:
 *     tags:
 *      - Message
 *     summary: Xác nhận đã đọc hết tin nhắn trong room chat
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/SendMessage'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/MessageRes'
 *       400:
 *         description: Bad Request
 */
router.post(
  "/",
  verifyToken,
  bodyMiddleware(SendMessageSchema),
  checkUserExist,
  MessageController.sendMessage
)

export default router
