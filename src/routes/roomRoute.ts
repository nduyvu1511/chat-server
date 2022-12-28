import Express from "express"
import RoomController from "../controllers/roomController"
import {
  bodyMiddleware,
  checkRoomByDependIdParamsExist,
  checkRoomParamsExist,
  checkUserExist,
  paramsMiddleware,
  queryMiddleware,
  verifyToken,
  verifyTokenAndDriver,
} from "../middlewares"
import {
  addMessagePinnedSchema,
  addMessageUnReadSchema,
  dependIdSchema,
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
 *           type: number
 *     summary: Xoá cuộc hội thoại bằng room id
 *     description: Dùng để xóa cuộc hội thoại, chỉ dùng cho tài xế
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
  paramsMiddleware(roomIdSchema),
  checkRoomParamsExist,
  RoomController.softDeleteRoom
)

/**
 * @openapi
 * '/api/room/depend_id/{depend_id}':
 *  delete:
 *     tags:
 *      - Room
 *     parameters:
 *       - in: path
 *         name: depend_id
 *         required: true
 *         schema:
 *           type: number
 *     summary: Xoá cuộc hội thoại cho kết thúc chuyến đi hoặc hủy chuyến
 *     description: Dùng để xóa tất các cuộc hội thoại(đơn, nhóm) của tài xế đối với hành khách trong chuyến đi này, dùng trong trường hợp kết thúc chuyến đi, dành cho tài xế
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
 *         description: Bad Request1
 */
router.delete(
  "/depend_id/:depend_id",
  verifyTokenAndDriver,
  paramsMiddleware(dependIdSchema),
  RoomController.softDeleteRoomsByDependId
)

// router.patch(
//   "/restore/ride/:depend_id",
//   verifyTokenAndDriver,
//   paramsMiddleware(dependIdSchema),
//   RoomController.restoreSoftDeleteRoomByDependId
// )

/**
 * @openapi
 * '/api/room/restore/{room_id}':
 *  patch:
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
router.patch(
  "/restore/:room_id",
  verifyTokenAndDriver,
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
  "/:room_id/message_unread/:user_id",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  RoomController.clearMessageUnreadFromRoom
)

// router.post(
//   "/:room_id/member/:user_id",
//   verifyToken,
//   paramsMiddleware(addMemberToRoomSchema),
//   checkPartnerParamsExist,
//   checkRoomParamsExist,
//   RoomController.addMemberToRoom
// )

// router.delete(
//   "/:room_id/member/:user_id",
//   verifyToken,
//   paramsMiddleware(deleteMemberFromRoomSchema),
//   checkPartnerParamsExist,
//   checkRoomParamsExist,
//   RoomController.deleteMemberFromRoom
// )

/**
 * @openapi
 * '/api/room/depend_id/{depend_id}/leave':
 *  delete:
 *     tags:
 *      - Room
 *     summary: Rời nhóm chat
 *     description: API này dành cho khách hàng sau khi hủy chuyến, chỉ dùng cho group chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depend_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: string
 *                room_id:
 *                  type: string
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/depend_id/:depend_id/leave",
  verifyToken,
  paramsMiddleware(dependIdSchema),
  checkRoomByDependIdParamsExist,
  RoomController.leaveRoom
)

/**
 * @openapi
 * '/api/room/depend_id/{depend_id}/join':
 *  post:
 *     tags:
 *      - Room
 *     summary: Tham gia nhóm chat
 *     description: API này được dùng trong trường hợp khách hàng tham gia nhóm chat sau khi đặt cọc thành công, chỉ dùng cho group chat
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depend_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: string
 *                room_id:
 *                  type: string
 *       400:
 *         description: Bad Request
 */
router.post(
  "/depend_id/:depend_id/join",
  verifyToken,
  paramsMiddleware(dependIdSchema),
  checkRoomByDependIdParamsExist,
  RoomController.joinRoom
)

/**
 * @openapi
 * '/api/room':
 *  get:
 *     tags:
 *      - Room
 *     summary: Lấy danh sách phòng chat
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
