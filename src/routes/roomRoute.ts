import Express from "express"
import RoomController from "../controllers/roomController"
import {
  bodyMiddleware,
  checkPartnerParamsExist,
  checkRoomByCompoundingCarIdParamsExist,
  checkRoomParamsExist,
  checkUserExist,
  paramsMiddleware,
  queryMiddleware,
  verifyToken,
  verifyTokenAndDriver,
} from "../middlewares"
import {
  addMemberToRoomByCompoundingCarIdSchema,
  addMemberToRoomSchema,
  addMessagePinnedSchema,
  addMessageUnReadSchema,
  compoundingCarIdSchema,
  createGroupChatSchema,
  createSingleChatSchema,
  deleteMemberFromRoomByCompoundingCarIdSchema,
  deleteMemberFromRoomSchema,
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

router.delete(
  "/:room_id",
  verifyTokenAndDriver,
  paramsMiddleware(roomIdSchema),
  RoomController.softDeleteRoom
)

/**
 * @openapi
 * '/api/room/ride/{compounding_car_id}/destroy':
 *  delete:
 *     tags:
 *      - Room
 *     parameters:
 *       - in: path
 *         name: compounding_car_id
 *         required: true
 *         schema:
 *           type: number
 *     summary: Xoá cuộc hội thoại cho hủy chuyến
 *     description: Dùng để xóa cuộc hội thoại trong trường hợp hủy chuyến, dành cho tài xế
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
  "/ride/:compounding_car_id/destroy",
  verifyTokenAndDriver,
  paramsMiddleware(compoundingCarIdSchema),
  checkRoomByCompoundingCarIdParamsExist,
  RoomController.destroyRoom
)

/**
 * @openapi
 * '/api/room/ride/{compounding_car_id}':
 *  delete:
 *     tags:
 *      - Room
 *     parameters:
 *       - in: path
 *         name: compounding_car_id
 *         required: true
 *         schema:
 *           type: number
 *     summary: Xoá cuộc hội thoại cho kết thúc chuyến đi
 *     description: Dùng để xóa các cuộc hội thoại(đơn, nhóm) của tài xế đối với hành khách trong chuyến đi này, dùng trong trường hợp kết thúc chuyến đi, dành cho tài xế
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
  "/ride/:compounding_car_id",
  verifyTokenAndDriver,
  paramsMiddleware(compoundingCarIdSchema),
  checkRoomByCompoundingCarIdParamsExist,
  RoomController.softDeleteRoomByCompoundingCarId
)

// router.patch(
//   "/restore/ride/:compounding_car_id",
//   verifyTokenAndDriver,
//   paramsMiddleware(compoundingCarIdSchema),
//   RoomController.restoreSoftDeleteRoomByCompoundingCarId
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

/**
 * @openapi
 * '/api/room/{room_id}/member/{user_id}':
 *  post:
 *     tags:
 *      - Room
 *     summary: Thêm user vào phòng
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: number
 *           summary: là partner id của server exxe
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: null
 *       400:
 *         description: Bad Request
 */
router.post(
  "/:room_id/member/:user_id",
  verifyToken,
  paramsMiddleware(addMemberToRoomSchema),
  checkPartnerParamsExist,
  checkRoomParamsExist,
  RoomController.addMemberToRoom
)

/**
 * @openapi
 * '/api/room/{room_id}/member/{user_id}':
 *  delete:
 *     tags:
 *      - Room
 *     summary: Xóa user ra khỏi phòng
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: number
 *           summary: là partner id của server exxe
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: null
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/:room_id/member/:user_id",
  verifyToken,
  paramsMiddleware(deleteMemberFromRoomSchema),
  checkPartnerParamsExist,
  checkRoomParamsExist,
  RoomController.deleteMemberFromRoom
)

/**
 * @openapi
 * '/api/room/ride/{compounding_car_id}/leave':
 *  delete:
 *     tags:
 *      - Room
 *     summary: Xóa user ra khỏi phòng theo compounding_car_id
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: compounding_car_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: null
 *       400:
 *         description: Bad Request
 */
router.delete(
  "/ride/:compounding_car_id/leave",
  verifyToken,
  paramsMiddleware(compoundingCarIdSchema),
  checkRoomByCompoundingCarIdParamsExist,
  RoomController.leaveRoom
)

/**
 * @openapi
 * '/api/room/ride/{compounding_car_id}/join':
 *  post:
 *     tags:
 *      - Room
 *     summary: Thêm user vào phòng theo compounding_car_id
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: compounding_car_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: null
 *       400:
 *         description: Bad Request
 */
router.post(
  "/ride/:compounding_car_id/join",
  verifyToken,
  paramsMiddleware(compoundingCarIdSchema),
  checkRoomByCompoundingCarIdParamsExist,
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
