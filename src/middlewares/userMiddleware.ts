import Express from "express"
import User from "../models/user"
import ResponseError from "../utils/apiError"

export async function checkUserExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data = await User.findById(req.locals._id).lean()
    if (!data) {
      return res.json(new ResponseError("User not found"))
    }
    req.locals = { ...data, ...req.locals }
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}
