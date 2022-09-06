import Joi from "joi"
import { PHONE_REGEX } from "../constant"
import {
  BlockOrUnBlockUserParams,
  ChangePasswordParams,
  changeUserStatusParams,
  CreatePasswordParams,
  CreateUserParams,
  GetTokenParams,
  LoginParams,
  RegisterParams,
  UpdateProfileParams,
} from "../types"

export const createUserSchema = Joi.object<CreateUserParams>({
  user_name: Joi.string(),
  user_id: Joi.number().required(),
  avatar: Joi.string().optional(),
  bio: Joi.string().optional().valid(""),
  date_of_birth: Joi.string().optional().valid(""),
  gender: Joi.string().valid("male", "female", "no_info").optional().valid(""),
  phone: Joi.string().regex(PHONE_REGEX, "Phone is invalid").required(),
  role: Joi.string().valid("customer", "active_driver", "admin", "in_active_driver").required(),
})

export const GetTokenSchema = Joi.object<GetTokenParams>({
  user_id: Joi.number().required(),
  phone: Joi.string().min(10).required(),
})

export const updateProfleSchema = Joi.object<UpdateProfileParams>({
  user_name: Joi.string().optional(),
  avatar: Joi.string().optional(),
  bio: Joi.string().optional(),
  date_of_birth: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "no_info").optional(),
})

export const changeUserStatusSchema = Joi.object<changeUserStatusParams>({
  is_online: Joi.boolean().required(),
})

export const blockOrUnblockUserSchema = Joi.object<BlockOrUnBlockUserParams>({
  partner_id: Joi.string().min(8).disallow(Joi.ref("user_id")).required(),
  status: Joi.string().valid("block", "unblock").required(),
})

export const loginSchema = Joi.object<LoginParams>({
  phone: Joi.string().min(10).required(),
  password: Joi.string().min(8).required(),
})

export const registerSchema = Joi.object<RegisterParams>({
  user_id: Joi.number().required(),
  phone: Joi.string().regex(PHONE_REGEX).required(),
  password: Joi.string().min(8).required(),
  confirm_password: Joi.string().valid(Joi.ref("password")).required(),
  role: Joi.string().allow("customer", "active_driver", "admin", "in_active_driver"),
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
