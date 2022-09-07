import Joi from "joi"
import { Lnglat, QueryCommonParams } from "../types/commonType"

export const queryCommonSchema = Joi.object<QueryCommonParams>({
  offset: Joi.number().optional(),
  limit: Joi.number().optional(),
})

export const LngLatSchema = Joi.object<Lnglat>({
  lng: Joi.string().required(),
  lat: Joi.string().required(),
})
