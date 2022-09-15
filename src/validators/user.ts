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

export const createUserSchema = Joi.object<CreateUserParams>({
  user_name: Joi.string(),
  user_id: Joi.number().required(),
  avatar: Joi.string().required(),
  bio: Joi.string().optional(),
  date_of_birth: Joi.string().regex(DATE_REGEX).optional(),
  gender: Joi.string().valid("male", "female", "no_info").optional(),
  phone: Joi.string().regex(PHONE_REGEX, "Phone is invalid").required(),
  role: Joi.string().valid("customer", "active_driver", "admin", "in_active_driver").required(),
})

export const GetTokenSchema = Joi.object<GetTokenParams>({
  user_id: Joi.number().required(),
  phone: Joi.string().min(10).required(),
})

export const updateProfleSchema = Joi.object<UpdateProfile>({
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

export const loginSchema = Joi.object<LoginParams>({
  phone: Joi.string().min(10).required(),
  password: Joi.string().min(8).required(),
})

export const loginSocketSchema = Joi.object<LoginSocket>({
  socket_id: Joi.string().required(),
})

export const registerSchema = Joi.object<RegisterParams>({
  user_id: Joi.number().required(),
  phone: Joi.string().regex(PHONE_REGEX).required(),
  password: Joi.string().min(8).required(),
  confirm_password: Joi.string().valid(Joi.ref("password")).required(),
  role: Joi.string().allow("customer", "driver", "admin"),
})

export const changePasswordSchema = Joi.object<ChangePasswordParams>({
  current_password: Joi.string().min(8).required(),
  new_password: Joi.string()
    .min(8)
    .required()
    .disallow(Joi.ref("current_password"), "New password must different from current password"),
  confirm_new_password: Joi.string().min(8).required().valid(Joi.ref("new_password")),
})

export const createPasswordSchema = Joi.object<CreatePasswordParams>({
  new_password: Joi.string().min(8).required(),
  confirm_new_password: Joi.string().min(8).valid(Joi.ref("new_password")).required(),
})
