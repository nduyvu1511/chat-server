import Express from "express"
import { isObjectID } from "../constant"
import User from "../models/user"
import { IUser } from "../types"
import ResponseError from "../utils/apiError"

export async function checkUserExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IUser | null = await User.findById(req.user._id).lean()
    if (!data) {
      return res.json(new ResponseError("User not found"))
    }
    req.user = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}

export async function checkPartnerParamsExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const { user_id } = req.params

    const data: IUser | null = await User.findOne(
      isObjectID(user_id) ? { _id: user_id } : { user_id }
    ).lean()
    if (!data) {
      return res.json(new ResponseError("User not found"))
    }
    req.partner = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}
