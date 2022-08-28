import User from "../models/user"
import Express from "express"
import ResponseData from "../utils/apiRes"
import { IUser } from "../types"

export async function checkUserExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data = await User.findById(req.locals.user_id).lean()
    if (!data) {
      return res.json(new ResponseData<IUser | null>("Không tìm thầy người dùng", 400, false, data))
    }
    req.locals = { ...req.locals, ...data }
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}
