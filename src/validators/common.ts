import Joi from "joi"
import { OBJECT_ID_REGEX } from "../constant"
import { CreateTagMessage, Lnglat, QueryCommonParams, UpdateTagMessage } from "../types/commonType"

export const queryCommonSchema = Joi.object<QueryCommonParams>({
  offset: Joi.number().optional(),
  limit: Joi.number().optional(),
})

export const LngLatSchema = Joi.object<Lnglat>({
  lng: Joi.string().required(),
  lat: Joi.string().required(),
})

export const createTagMessageSchema = Joi.object<CreateTagMessage>({
  role: Joi.string().allow("customer", "driver", "admin").required(),
  text: Joi.string().required(),
})

export const getTagMessageListSchema = Joi.object<QueryCommonParams>({
  limit: Joi.number().optional(),
  offset: Joi.number().optional(),
})

export const updateTagMessageSchema = Joi.object<UpdateTagMessage>({
  role: Joi.string().allow("customer", "driver", "admin").optional(),
  text: Joi.string().optional(),
})

export const tagIdParamsSchema = Joi.object<{ tag_id: string }>({
  tag_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})
