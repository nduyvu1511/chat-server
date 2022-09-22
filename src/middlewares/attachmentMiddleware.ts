import Express from "express"
import Attachment from "../models/attachment"
import { IAttachment } from "../types"
import ResponseError from "../utils/apiError"

export async function checkAttachmentBodyExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IAttachment | null = await Attachment.findById(req.body.attachment_id).lean()
    if (!data) {
      return res.json(new ResponseError("Attachment not found"))
    }

    req.attachment = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}

export async function checkAttachmentParamsExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IAttachment | null = await Attachment.findById(req.params.attachment_id).lean()
    if (!data) {
      return res.json(new ResponseError("Attachment not found"))
    }

    req.attachment = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}
