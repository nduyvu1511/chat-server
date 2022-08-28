import Express from "express"
import UserController from "../controllers/userController"
import { bodyMiddleware, checkUserExist, queryMiddleware, verifyToken } from "../middlewares"
import {
  blockOrUnblockUserSchema,
  changeUserStatusSchema,
  createUserSchema,
  loginSchema,
  queryCommonSchema,
  registerSchema,
  updateProfleSchema,
} from "../validators"
const router = Express.Router()

router.post("/register", bodyMiddleware(registerSchema), UserController.register)
router.post("/login", bodyMiddleware(loginSchema), UserController.login)
router.post("/create_user", bodyMiddleware(createUserSchema), UserController.createUser)
router.patch(
  "/update_profile",
  verifyToken,
  bodyMiddleware(updateProfleSchema),
  UserController.updateProfile
)
router.patch(
  "/change_status",
  verifyToken,
  bodyMiddleware(changeUserStatusSchema),
  checkUserExist,
  UserController.changeStatus
)
router.post(
  "/block_or_unblock_user",
  verifyToken,
  bodyMiddleware(blockOrUnblockUserSchema),
  checkUserExist,
  UserController.blockOrUnBlockUser
)
router.get(
  "/get_block_user_list",
  verifyToken,
  queryMiddleware(queryCommonSchema),
  checkUserExist,
  UserController.getBlockUserList
)

export default router
