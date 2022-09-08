import Express from "express"
import MessageController from "../controllers/messageController"
import { bodyMiddleware, verifyToken } from "../middlewares"
import { SendMessageSchema } from "./../validators/message"
const router = Express.Router()

router.post("/", verifyToken, bodyMiddleware(SendMessageSchema), MessageController.sendMessage)

export default router
