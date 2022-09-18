import Express from "express"
import Message from "../models/message"
import { IMessage } from "../types"
import ResponseError from "../utils/apiError"

export async function checkMessageBodyExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IMessage | null = await Message.findById(req.body.message_id).lean()
    if (!data) {
      return res.json(new ResponseError("Message not found"))
    }

    req.message = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}

export async function checkMessageParamsExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IMessage | null = await Message.findById(req.params.message_id).lean()
    if (!data) {
      return res.json(new ResponseError("Message not found"))
    }

    req.message = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}
