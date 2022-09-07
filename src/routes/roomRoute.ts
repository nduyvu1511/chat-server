import Express from "express"
import RoomController from "../controllers/roomController"
import { bodyMiddleware, checkUserExist, queryMiddleware, verifyToken } from "../middlewares"
import { createGroupChatSchema, createPrivateChatSchema, getRoomListSchema } from "../validators"
const router = Express.Router()

router.get(
  "/",
  verifyToken,
  queryMiddleware(getRoomListSchema),
  checkUserExist,
  RoomController.getRoomList
)
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
router.get("/:room_id/members", verifyToken, RoomController.getRoomMembers)
router.get("/:room_id", verifyToken, RoomController.getRoomDetail)

export default router
