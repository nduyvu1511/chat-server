import Express from "express"
import UserController from "../controllers/userController"
import { bodyMiddleware, checkUserExist, queryMiddleware, verifyToken } from "../middlewares"
import {
  blockOrUnblockUserSchema,
  changePasswordSchema,
  changeUserStatusSchema,
  createPasswordSchema,
  createUserSchema,
  GetTokenSchema,
  loginSchema,
  queryCommonSchema,
  registerSchema,
  updateProfleSchema,
} from "../validators"
const router = Express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         user_id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *       example:
 *         id: d5fE_asz
 *         title: The New Turing Omnibus
 *         author: Alexander K. Dewdney
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

router.post("/register", bodyMiddleware(registerSchema), UserController.register)
router.post("/login", bodyMiddleware(loginSchema), UserController.login)
router.post("/create_user", bodyMiddleware(createUserSchema), UserController.createUser)
router.post("/generate_token", bodyMiddleware(GetTokenSchema), UserController.generateToken)
router.get("/info", verifyToken, UserController.getUserInfo)
router.patch(
  "/change_password",
  verifyToken,
  bodyMiddleware(changePasswordSchema),
  checkUserExist,
  UserController.changePassword
)
router.patch(
  "/update_profile",
  verifyToken,
  bodyMiddleware(updateProfleSchema),
  UserController.updateProfile
)
router.get("/check_has_password", verifyToken, checkUserExist, UserController.checkHasPassword)
router.post(
  "/create_password",
  verifyToken,
  bodyMiddleware(createPasswordSchema),
  checkUserExist,
  UserController.createPassword
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
