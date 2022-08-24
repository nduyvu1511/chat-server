import Joi from "joi"
import { PHONE_REGEX } from "../constant"
import { CreateUserParams } from "../types"

export const createUserSchema = Joi.object<CreateUserParams>({
  user_name: Joi.string().optional(),
  avatar: Joi.string().optional(),
  bio: Joi.string().optional(),
  date_of_birth: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "no_info").optional(),
  phone: Joi.string().regex(PHONE_REGEX, "Phone is invalid").required(),
  role: Joi.string().valid("customer", "active_driver", "admin", "in_active_driver").required(),
})
