import Express from "express"
import RoomController from "../controllers/roomController"
import {
  bodyMiddleware,
  checkUserExist,
  paramsMiddleware,
  queryMiddleware,
  verifyToken,
} from "../middlewares"
import {
  addMessagePinnedSchema,
  addMessageUnReadSchema,
  createGroupChatSchema,
  createSingleChatSchema,
  getRoomListSchema,
  listSchema,
  roomIdSchema,
  updateRoomSchema,
} from "../validators"

const router = Express.Router()

/**
 * @openapi
 * '/api/room/single':
 *  post:
 *     tags:
 *      - Room
 *     summary: Tạo phòng chat đơn
 *     description: Tạo phòng chat đơn, Nếu đã tồn tại thì sẽ trả về kết quả
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/CreateSingleChat'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/RoomDetailRes'
 *       400:
 *         description: Bad Request
 */
router.post(
  "/single",
  verifyToken,
  bodyMiddleware(createSingleChatSchema),
  checkUserExist,
  RoomController.createSingleChat
)

/**
 * @openapi
 * '/api/room/group':
 *  post:
 *     tags:
 *      - Room
 *     summary: Tạo phòng chat nhóm
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/CreateGroupChat'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/RoomDetailRes'
 *       400:
 *         description: Bad Request
 */
router.post(
  "/group",
  verifyToken,
  bodyMiddleware(createGroupChatSchema),
  checkUserExist,
  RoomController.createGroupChat
)

/**
 * @openapi
 * '/api/room/group':
 *  post:
 *     tags:
 *      - Room
 *     summary: Tạo phòng chat nhóm
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/CreateGroupChat'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/RoomDetailRes'
 *       400:
 *         description: Bad Request
 */

/**
 * @openapi
 * '/api/room/message_unread':
 *  post:
 *     tags:
 *      - Room
 *     summary: Thêm tin nhắn chưa đọc vào trong room chat
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
 *              required:
 *                - message_unread_count
 *              properties:
 *                message_unread_count:
 *                  type: number
 *       400:
 *         description: Bad Request
 */
router.post(
  "/message_unread",
  verifyToken,
  bodyMiddleware(addMessageUnReadSchema),
  RoomController.addMessageUnReadToRoom
)

/**
 * @openapi
 * '/api/room/{room_id}':
 *  delete:
 *     tags:
 *      - Room
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *     summary: Xoá cuộc hội thoại
 *     description: Dùng khi chuyến đi đã được hoàn thành
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *              room_id:
 *                type: string
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/:room_id",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  RoomController.softDeleteRoom
)

/**
 * @openapi
 * '/api/room/restore/{room_id}':
 *  delete:
 *     tags:
 *      - Room
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *     summary: Khôi phục cuộc hội thoại
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *              room_id:
 *                type: string
 *       400:
 *         description: Bad Request
 */
router.post(
  "/restore/:room_id",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  RoomController.restoreSoftDeleteRoom
)

/**
 * @openapi
 * '/api/room/{room_id}/message_unread':
 *  delete:
 *     tags:
 *      - Room
 *     summary: Xóa tất cả tin nhắn chưa đọc trong room chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - message_unread_count
 *              properties:
 *                message_unread_count:
 *                  type: number
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/:room_id/message_unread",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  RoomController.clearMessageUnreadFromRoom
)

/**
 * @openapi
 * '/api/room':
 *  get:
 *     tags:
 *      - Room
 *     summary: Lấy danh sách room chat
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
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *           summary: Tìm kiếm nhóm chat theo tên nhóm
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref : '#components/schema/RoomListRes'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/",
  verifyToken,
  queryMiddleware(getRoomListSchema),
  checkUserExist,
  RoomController.getRoomList
)

router.get("/ids", verifyToken, checkUserExist, RoomController.getUserJoinedRoomIds)

/**
 * @openapi
 * '/api/room/{room_id}':
 *  get:
 *     tags:
 *      - Room
 *     summary: Lấy chi tiết nhóm chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schema/RoomDetailRes'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/:room_id",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  checkUserExist,
  RoomController.getRoomDetail
)

/**
 * @openapi
 * '/api/room/{room_id}/pinned_messages':
 *  get:
 *     tags:
 *      - Room
 *     summary: Lấy danh sách tin nhắn được ghim trong nhóm chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
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
 *              $ref: '#components/schema/MessageListRes'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/:room_id/pinned_messages",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  queryMiddleware(listSchema),
  checkUserExist,
  RoomController.getRoomMessagesPinned
)

/**
 * @openapi
 * '/api/room/pinned_message':
 *  post:
 *     tags:
 *      - Room
 *     summary: Ghim tin nhắn vào nhóm chat
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
 *              $ref: '#components/schema/MessageRes'
 *       400:
 *         description: Bad Request
 */
router.post(
  "/pinned_message",
  verifyToken,
  bodyMiddleware(addMessagePinnedSchema),
  checkUserExist,
  RoomController.pinMessageToRoom
)

/**
 * @openapi
 * '/api/room/pinned_message/{message_id}':
 *  delete:
 *     tags:
 *      - Room
 *     summary: Xóa tin nhắn đã ghim trong nhóm chat
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
 *           schema:
 *             type: object
 *             properties:
 *              message_id:
 *                type: string
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/pinned_message/:message_id",
  verifyToken,
  paramsMiddleware(addMessagePinnedSchema),
  checkUserExist,
  RoomController.deleteMessagePinnedFromRoom
)

/**
 * @openapi
 * '/api/room/{room_id}/members':
 *  get:
 *     tags:
 *      - Room
 *     summary: Lấy danh sách người dùng trong nhóm chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
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
 *            $ref: '#/components/schema/RoomMemberListRes'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/:room_id/members",
  paramsMiddleware(roomIdSchema),
  queryMiddleware(listSchema),
  verifyToken,
  checkUserExist,
  RoomController.getRoomMembers
)

/**
 * @openapi
 * '/api/room/{room_id}/messages':
 *  get:
 *     tags:
 *      - Room
 *     summary: Lấy danh sách tin nhắn trong nhóm chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
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
 *            $ref: '#/components/schema/MessageListRes'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/:room_id/messages",
  paramsMiddleware(roomIdSchema),
  verifyToken,
  checkUserExist,
  RoomController.getMessagesInRoom
)

/**
 * @openapi
 * '/api/info/{room_id}':
 *  get:
 *     tags:
 *      - Room
 *     summary: Lấy danh sách tin nhắn trong nhóm chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/UpdateRoomInfo'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *            $ref: '#/components/schema/RoomResInfo'
 *       400:
 *         description: Bad Request
 */
router.patch(
  "/info/:room_id",
  paramsMiddleware(roomIdSchema),
  bodyMiddleware(updateRoomSchema),
  verifyToken,
  checkUserExist,
  RoomController.updateRoomInfo
)

export default router
