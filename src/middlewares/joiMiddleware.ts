import Express from "express"
import Joi from "joi"
import ResponseError from "../utils/apiError"

export const bodyMiddleware = (schema: Joi.ObjectSchema<any>) => {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const { error } = schema.validate(req.body)
    if (!error) {
      next()
    } else {
      const { details } = error
      const errorsDetail = details.map((i) => i.message)
      res.json(new ResponseError(errorsDetail.toString(), 400, false, null))
    }
  }
}

export const queryMiddleware = (schema: Joi.ObjectSchema<any>) => {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const { error } = schema.validate(req.query)
    if (!error) {
      next()
    } else {
      const { details } = error
      const errorsDetail = details.map((i) => i.message)
      res.json(new ResponseError(errorsDetail.toString(), 400, false, null))
    }
  }
}
