import Express from "express"
import AttachmentController from "../controllers/AttachmentController"
import { bodyMiddleware, verifyToken } from "../middlewares"
import { createAttachment } from "../validators"
const router = Express.Router()

router.post(
  "/",
  verifyToken,
  bodyMiddleware(createAttachment),
  AttachmentController.createAttachment
)

export default router
