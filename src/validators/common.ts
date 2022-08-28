import Joi from "joi"
import { QueryCommonParams } from "../types/commonType"

export const queryCommonSchema = Joi.object<QueryCommonParams>({
  offset: Joi.number().optional(),
  limit: Joi.number().optional(),
})
