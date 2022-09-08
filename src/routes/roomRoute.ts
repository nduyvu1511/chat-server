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
  createGroupChatSchema,
  createPrivateChatSchema,
  getRoomListSchema,
  listSchema,
  roomIdSchema,
} from "../validators"

const router = Express.Router()

router.post(
  "/private_chat",
  verifyToken,
  bodyMiddleware(createPrivateChatSchema),
  checkUserExist,
  RoomController.createPrivateChat
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
router.get(
  "/:room_id",
  verifyToken,
  paramsMiddleware(roomIdSchema),
  checkUserExist,
  RoomController.getRoomDetail
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
