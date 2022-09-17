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
  loginSocketSchema,
  queryCommonSchema,
  registerSchema,
  updateProfleSchema,
} from "../validators"
const router = Express.Router()

/**
 * @openapi
 * '/api/v1/user':
 *  post:
 *     tags:
 *      - User
 *     summary: Tạo mới user
 *     description: tạo ra 1 user mới, lấy dữ liệu từ Odoo
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/CreateUser'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/UserRes'
 *       400:
 *         description: Bad Request
 */
router.post("/", bodyMiddleware(createUserSchema), UserController.createUser)

router.post("/register", bodyMiddleware(registerSchema), UserController.register)
router.post("/login", bodyMiddleware(loginSchema), UserController.login)

/**
 * @openapi
 * components:
 *    securitySchemes:
 *     BearerAuth:
 *      type: http
 *      scheme: bearer
 */

/**
 * @openapi
 * '/api/v1/user/login_to_socket':
 *  post:
 *     tags:
 *       - User
 *     summary: Đăng nhập vào socket
 *     security:
 *      - BearerAuth: []
 *     description: Thêm socket id vào User, đổi trạng thái sang online, sau khi có kết quả trả về, truyền kết quả trả về gửi lên cho socket "\io socket.emit("login", user)\"
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/LoginToSocket'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schema/UserRes'
 *       400:
 *         description: Bad Request
 */
router.post(
  "/login_to_socket",
  verifyToken,
  bodyMiddleware(loginSocketSchema),
  UserController.loginToSocket
)

/**
 * @openapi
 * '/api/v1/user/generate_token':
 *  post:
 *     tags:
 *       - User
 *     summary: Tạo token từ SĐT và UserID
 *     description: tạo token từ SĐT và userID
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/GenerateToken'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schema/UserRes'
 *       400:
 *         description: Bad Request
 */
router.post("/generate_token", bodyMiddleware(GetTokenSchema), UserController.generateToken)

/**
 * @openapi
 * '/api/v1/user/password':
 *  get:
 *     tags:
 *       - User
 *     summary: Kiểm tra tài khoản có mật khẩu hay chưa
 *     security:
 *      - BearerAuth: []
 *     description: kiểm tra account đã có mật khẩu hay chưa
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *              has_password:
 *                type: boolean
 *       400:
 *         description: Bad Request
 */
router.get("/password", verifyToken, checkUserExist, UserController.checkHasPassword)

/**
 * @openapi
 * '/api/v1/user/password':
 *  post:
 *     tags:
 *       - User
 *     summary: Tạo mật khẩu
 *     security:
 *      - BearerAuth: []
 *     description: tạo mật khẩu trong trường hợp chưa có mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/CreatePassword'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *              has_password:
 *                type: boolean
 *       400:
 *         description: Bad Request
 */
router.post(
  "/password",
  verifyToken,
  bodyMiddleware(createPasswordSchema),
  checkUserExist,
  UserController.createPassword
)

/**
 * @openapi
 * '/api/v1/user/password':
 *  patch:
 *     tags:
 *       - User
 *     summary: Đổi mật khẩu
 *     security:
 *      - BearerAuth: []
 *     description: đổi mật khẩu trong trường hợp đã có mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schema/ChangePassword'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *              has_password:
 *                type: boolean
 *       400:
 *         description: Bad Request
 */
router.patch(
  "/password",
  verifyToken,
  bodyMiddleware(changePasswordSchema),
  checkUserExist,
  UserController.changePassword
)

/**
 * @openapi
 * '/api/v1/user/profile':
 *  get:
 *     tags:
 *       - User
 *     summary: Lấy thông tin người dùng
 *     security:
 *      - BearerAuth: []
 *     description: Lấy thông tin người dùng, không truyền tham số thì lấy thông tin của bản thân, truyền thì lấy của người được truyền
 *     parameters:
 *      - in: query
 *        name: user_id
 *        required: false
 *        schema:
 *          type: string
 *          required: false
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schema/UserRes'
 *       400:
 *         description: Bad Request
 */
router.get("/profile", verifyToken, UserController.getUserInfo)

/**
 * @openapi
 * '/api/v1/user/profile':
 *  patch:
 *     tags:
 *       - User
 *     summary: Chỉnh sửa thông tin người dùng
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/UpdateProfile'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schema/UserRes'
 *       400:
 *         description: Bad Request
 */
router.patch(
  "/profile",
  verifyToken,
  bodyMiddleware(updateProfleSchema),
  checkUserExist,
  UserController.updateProfile
)
router.patch(
  "/status",
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
  "/block_user_list",
  verifyToken,
  queryMiddleware(queryCommonSchema),
  checkUserExist,
  UserController.getBlockUserList
)

export default router
