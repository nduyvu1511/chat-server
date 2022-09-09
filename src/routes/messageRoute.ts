import Express from "express"
import MessageController from "../controllers/messageController"
import { bodyMiddleware, checkUserExist, verifyToken } from "../middlewares"
import { SendMessageSchema } from "./../validators/message"
const router = Express.Router()

router.post(
  "/",
  verifyToken,
  bodyMiddleware(SendMessageSchema),
  checkUserExist,
  MessageController.sendMessage
)

export default router
