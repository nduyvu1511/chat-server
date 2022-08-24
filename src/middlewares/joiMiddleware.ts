import Express from "express"
import Joi from "joi"

export const bodyMiddleware = (schema: Joi.ObjectSchema<any>) => {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const { error } = schema.validate(req.body)
    if (!error) {
      next()
    } else {
      const { details } = error
      const errorsDetail = details.map((i) => i.message)
      res.status(422).json({
        status: false,
        error: errorsDetail,
      })
    }
  }
}
