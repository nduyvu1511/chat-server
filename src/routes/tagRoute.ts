import Express from "express"
import TagController from "../controllers/tagController"
import { bodyMiddleware, paramsMiddleware, queryMiddleware, verifyToken } from "../middlewares"
import {
  createTagMessageSchema,
  getTagMessageListSchema,
  tagIdParamsSchema,
  updateTagMessageSchema,
} from "../validators"
const router = Express.Router()

router.get(
  "/",
  queryMiddleware(getTagMessageListSchema),
  verifyToken,
  TagController.getTagMessageList
)
router.post(
  "/",
  bodyMiddleware(createTagMessageSchema),
  verifyToken,
  TagController.createTagMessage
)
router.put(
  "/:tag_id",
  paramsMiddleware(tagIdParamsSchema),
  queryMiddleware(updateTagMessageSchema),
  verifyToken,
  TagController.updateTagMessage
)
router.delete(
  "/:tag_id",
  paramsMiddleware(tagIdParamsSchema),
  verifyToken,
  TagController.deleteTagMessage
)

export default router
