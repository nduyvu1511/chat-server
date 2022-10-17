import Joi from "joi"
import { DATE_REGEX, OBJECT_ID_REGEX, PHONE_REGEX, URL_REGEX } from "../constant"
import {
  BlockOrUnBlockUserParams,
  ChangePasswordParams,
  changeUserStatusParams,
  CreatePasswordParams,
  CreateUserParams,
  GetTokenParams,
  LoginParams,
  LoginSocket,
  RegisterParams,
  UpdateProfile,
} from "../types"

/**
 * @openapi
 * components:
 *  schema:
 *    CreateUser:
 *      type: object
 *      required:
 *        - user_id
 *        - avatar
 *        - phone
 *        - role
 *      properties:
 *        user_name:
 *          type: string
 *          default: justin
 *        user_id:
 *          type: number
 *          unique: true
 *          summary: Lấy từ partner_id của server Exxe
 *          default: 1
 *        avatar:
 *          type: string
 *          default: https://quanly.exxe.vn/......
 *          summary: Lấy từ URL avatar của user, phải ghép thêm domain vào 'https:quanly.exxe.vn/.....'
 *        bio:
 *          type: string
 *          summary: person's biography
 *          default: love cat
 *        date_of_birth:
 *          type: date
 *          format: YYYY-MM-DD
 *          default: 2000-11-15
 *        gender:
 *          type: string
 *          default: male
 *          enum: [male, female, no_info]
 *        phone:
 *          type: string
 *          summary: Takes Phone from partner info, unique value
 *          default: '0977066232'
 *          regex: /((^(\+84|84|0|0084){1})(3|5|7|8|9))+([0-9]{8})$/
 *        role:
 *          type: string
 *          enum: [customer, driver, admin]
 *          default: customer
 */
export const createUserSchema = Joi.object<CreateUserParams>({
  user_name: Joi.string(),
  user_id: Joi.number().required(),
  avatar: Joi.string().required(),
  bio: Joi.string().optional().allow("", null),
  date_of_birth: Joi.string().regex(DATE_REGEX).optional().allow("", null),
  gender: Joi.string().valid("male", "female", "no_info").optional().allow("", null),
  phone: Joi.string().regex(PHONE_REGEX, "Phone is invalid").required(),
  role: Joi.string().valid("customer", "car_driver", "admin").required(),
})

/**,
 * @openapi
 * components:
 *  schema:
 *    GenerateToken:
 *      type: object
 *      required:
 *        - user_id
 *        - phone
 *      properties:
 *        user_id:
 *          type: number
 *          unique: true
 *          summary: Lấy từ partner_id của server server Exxe
 *          example: 1
 *        phone:
 *          type: string
 *          summary: Lấy từ SĐT của partner
 *          example: '0977066232'
 *          regex: /((^(\+84|84|0|0084){1})(3|5|7|8|9))+([0-9]{8})$/
 */
export const GetTokenSchema = Joi.object<GetTokenParams>({
  user_id: Joi.number().required(),
  phone: Joi.string().min(10).required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    UpdateProfile:
 *      type: object
 *      properties:
 *        user_name:
 *          type: string
 *          example: user name
 *        avatar:
 *          type: string
 *          summary: Lấy từ URL avatar của user, phải ghép thêm domain vào 'https:quanly.exxe.vn/.....'
 *        bio:
 *          type: string
 *        date_of_birth:
 *          type: string
 *          regex: /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
 *          example: 2000-11-15
 *        gender:
 *          type: string
 *          enum: [male, female, no_info]
 *          example: male
 */
export const updateProfileSchema = Joi.object<UpdateProfile>({
  user_name: Joi.string().optional(),
  avatar: Joi.string().regex(URL_REGEX).optional(),
  bio: Joi.string().optional(),
  date_of_birth: Joi.string().regex(DATE_REGEX).optional(),
  gender: Joi.string().valid("male", "female", "no_info").optional(),
})

export const changeUserStatusSchema = Joi.object<changeUserStatusParams>({
  is_online: Joi.boolean().required(),
  socket_id: Joi.string().required(),
})

export const blockOrUnblockUserSchema = Joi.object<BlockOrUnBlockUserParams>({
  partner_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
  status: Joi.string().valid("block", "unblock").required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    Login:
 *      type: object
 *      required:
 *       - phone
 *       - password
 *      properties:
 *        phone:
 *          type: string
 *          min: 10
 *          summary: Lấy từ phone của server Exxe
 *        password:
 *          type: string
 *          min: 8
 */
export const loginSchema = Joi.object<LoginParams>({
  phone: Joi.string().min(10).required(),
  password: Joi.string().min(8).required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    RefreshToken:
 *      type: object
 *      required:
 *        - refresh_token
 *      properties:
 *        refresh_token:
 *          type: string
 */
export const refreshTokenSchema = Joi.object<{ refresh_token: string }>({
  refresh_token: Joi.string().required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    LoginToSocket:
 *      type: object
 *      required:
 *        - socket_id
 *      properties:
 *        socket_id:
 *          type: string
 *          summary: Lấy id này từ 1 instance của socket khi connect
 */
export const loginSocketSchema = Joi.object<LoginSocket>({
  socket_id: Joi.string().required(),
})

export const registerSchema = Joi.object<RegisterParams>({
  user_id: Joi.number().required(),
  phone: Joi.string().regex(PHONE_REGEX).required(),
  password: Joi.string().min(8).required(),
  confirm_password: Joi.string().valid(Joi.ref("password")).required(),
  role: Joi.string().allow("customer", "car_driver", "admin").required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    ChangePassword:
 *      type: object
 *      required:
 *        - new_password
 *        - confirm_new_password
 *      properties:
 *        current_password:
 *          type: string
 *          summary: Mật khẩu cũ
 *          min: 8
 *        new_password:
 *          type: string
 *          summary: Mật khẩu mới không được trùng với mật khẩu cũ
 *          min: 8
 *        confirm_new_password:
 *          type: string
 *          summary: Xác nhận mật khẩu mới
 *          min: 8
 */
export const changePasswordSchema = Joi.object<ChangePasswordParams>({
  current_password: Joi.string().min(8).required(),
  new_password: Joi.string()
    .min(8)
    .required()
    .disallow(Joi.ref("current_password"), "New password must different from current password"),
  confirm_new_password: Joi.string().min(8).required().valid(Joi.ref("new_password")),
})

/**
 * @openapi
 * components:
 *  schema:
 *    CreatePassword:
 *      type: object
 *      required:
 *        - new_password
 *        - confirm_new_password
 *      properties:
 *        new_password:
 *          type: string
 *          summary: Mật khẩu mới
 *          min: 8
 *        confirm_new_password:
 *          type: string
 *          summary: Xác nhận mật khẩu mới
 *          min: 8
 */

export const createPasswordSchema = Joi.object<CreatePasswordParams>({
  new_password: Joi.string().min(8).required(),
  confirm_new_password: Joi.string().min(8).valid(Joi.ref("new_password")).required(),
})
