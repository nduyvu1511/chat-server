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
} from "../validators"

const router = Express.Router()

router.post(
  "/single_chat",
  verifyToken,
  bodyMiddleware(createSingleChatSchema),
  checkUserExist,
  RoomController.createSingleChat
)
router.post(
  "/message_unread",
  verifyToken,
  bodyMiddleware(addMessageUnReadSchema),
  RoomController.addMessageUnReadToRoom
)
router.delete(
  "/:room_id/message_unread",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  RoomController.clearMessageUnreadFromRoom
)
router.post(
  "/group_chat",
  verifyToken,
  bodyMiddleware(createGroupChatSchema),
  checkUserExist,
  RoomController.createGroupChat
)
router.get(
  "/",
  verifyToken,
  queryMiddleware(getRoomListSchema),
  checkUserExist,
  RoomController.getRoomList
)
router.get("/ids", verifyToken, checkUserExist, RoomController.getUserJoinedRoomIds)
router.get(
  "/:room_id",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  checkUserExist,
  RoomController.getRoomDetail
)
router.get(
  "/:room_id/pinned_messages",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  queryMiddleware(listSchema),
  checkUserExist,
  RoomController.getRoomMessagesPinned
)
router.post(
  "/pinned_message",
  verifyToken,
  bodyMiddleware(addMessagePinnedSchema),
  checkUserExist,
  RoomController.pinMessageToRoom
)
router.delete(
  "/pinned_message/:message_id",
  verifyToken,
  paramsMiddleware(addMessagePinnedSchema),
  checkUserExist,
  RoomController.deleteMessagePinnedFromRoom
)
router.get(
  "/:room_id/members",
  paramsMiddleware(roomIdSchema),
  queryMiddleware(listSchema),
  verifyToken,
  checkUserExist,
  RoomController.getRoomMembers
)
router.get(
  "/:room_id/messages",
  paramsMiddleware(roomIdSchema),
  verifyToken,
  checkUserExist,
  RoomController.getMessagesInRoom
)

export default router
