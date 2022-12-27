import Express from "express"
import Room from "../models/room"
import { IRoom } from "../types"
import ResponseError from "../utils/apiError"

export async function checkRoomBodyExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IRoom | null = await Room.findOne({
      $and: [{ _id: req.body.room_id }, { is_deleted: false }],
    }).lean()
    if (!data) {
      return res.json(new ResponseError("Room not found"))
    }

    req.room = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}

export async function checkRoomParamsExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IRoom | null = await Room.findOne({
      $and: [{ _id: req.params.room_id }, { is_deleted: false }],
    }).lean()
    if (!data) {
      return res.json(new ResponseError("Room not found"))
    }

    req.room = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}

export async function checkRoomByDependIdParamsExist(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  try {
    const data: IRoom | null = await Room.findOne({
      $and: [
        {
          depend_id: req.params.depend_id,
        },
        { is_deleted: false },
      ],
    }).lean()
    if (!data) {
      return res.json(new ResponseError("Room not found"))
    }

    req.room = data
    return next()
  } catch (error) {
    return res.status(400).send(error)
  }
}
