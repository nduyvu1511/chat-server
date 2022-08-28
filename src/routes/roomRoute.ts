import Express from "express"
import RoomController from "../controllers/roomController"
import { bodyMiddleware, queryMiddleware, verifyToken } from "../middlewares"
import { createGroupChatSchema, createPrivateChatSchema } from "../validators"
const router = Express.Router()

router.post(
  "/create_private_chat",
  verifyToken,
  bodyMiddleware(createPrivateChatSchema),
  RoomController.createPrivateChat
)
router.post(
  "/create_group_chat",
  verifyToken,
  bodyMiddleware(createGroupChatSchema),
  RoomController.createGroupChat
)
router.post(
  "/get_room_list",
  verifyToken,
  queryMiddleware(createGroupChatSchema),
  RoomController.getRoomList
)

export default router
