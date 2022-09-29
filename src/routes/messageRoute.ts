import Express from "express"
import MessageController from "../controllers/messageController"
import {
  bodyMiddleware,
  checkMessageBodyExist,
  checkMessageParamsExist,
  checkRoomBodyExist,
  checkUserExist,
  paramsMiddleware,
  queryMiddleware,
  verifyToken,
} from "../middlewares"
import {
  likeMessageSchema,
  listSchema,
  messageIdSchema,
  readLastMessageSchema,
  readMessageSchema,
  SendMessageSchema,
} from "../validators"
const router = Express.Router()

/**
 * @openapi
 * '/api/message/{message_id}/users_read':
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
  checkMessageParamsExist,
  MessageController.getUsersReadMessage
)

/**
 * @openapi
 * '/api/message/read':
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
 * '/api/message/read_all':
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
 * '/api/message':
 *  post:
 *     tags:
 *      - Message
 *     summary: Gửi tin nhắn
 *     description: Lưu ý phần parameters
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
  checkRoomBodyExist,
  MessageController.sendMessage
)

/**
 * @openapi
 * '/api/message/{message_id}':
 *  get:
 *     tags:
 *      - Message
 *     summary: Lấy tin nhắn theo ID
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/MessageRes'
 *       400:
 *         description: Bad Request
 */
router.get("/:message_id", verifyToken, checkUserExist, MessageController.getMessageById)

/**
 * @openapi
 * '/api/message/like':
 *  post:
 *     tags:
 *      - Message
 *     summary: Bày tỏ cảm xúc tin nhắn
 *     description: Mỗi người chỉ được like tin nhắn 1 lần
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/LikeMessage'
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
  "/like",
  verifyToken,
  bodyMiddleware(likeMessageSchema),
  checkMessageBodyExist,
  checkUserExist,
  MessageController.likeMessage
)

/**
 * @openapi
 * '/api/message/unlike/{message_id}':
 *  delete:
 *     tags:
 *      - Message
 *     summary: Bỏ thích tin nhắn
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/MessageRes'
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/unlike/:message_id",
  verifyToken,
  paramsMiddleware(messageIdSchema),
  MessageController.unlikeMessage
)

/**
 * @openapi
 * '/api/message/users/like/{message_id}':
 *  get:
 *     tags:
 *      - Message
 *     summary: Lấy danh sách những người đã thích tin nhắn
 *     description: Nhóm theo các trạng thái laugh, like, angry, sad, laugh, heart, wow, all
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
 *            schema:
 *              $ref: '#/components/schema/UserLikedMessage'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/users/like/:message_id",
  verifyToken,
  queryMiddleware(listSchema),
  paramsMiddleware(messageIdSchema),
  checkUserExist,
  MessageController.getUsersLikedMessage
)

export default router
