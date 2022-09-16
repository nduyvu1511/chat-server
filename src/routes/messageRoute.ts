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

router.get(
  "/:message_id/users_read",
  verifyToken,
  paramsMiddleware(messageIdSchema),
  MessageController.getUsersReadMessage
)
router.post(
  "/",
  verifyToken,
  bodyMiddleware(SendMessageSchema),
  checkUserExist,
  MessageController.sendMessage
)
router.post(
  "/read",
  verifyToken,
  bodyMiddleware(readMessageSchema),
  MessageController.confirmReadMessage
)
router.post(
  "/read_all",
  verifyToken,
  bodyMiddleware(readLastMessageSchema),
  MessageController.confirmReadAllMessageInRoom
)

export default router
