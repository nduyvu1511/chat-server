import Express from "express"
import _ from "lodash"
import { MESSAGES_LIMIT, USERS_LIMIT } from "../constant"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import { CreateGroupChat, IUser } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class RoomController {
  async createPrivateChat(req: Express.Request, res: Express.Response) {
    try {
      const { user_id } = req.locals
      const { partner_id } = req.body

      if (user_id === partner_id)
        return res.json(new ResponseError("Can not create room failed because missing partner"))

      const partner = await UserService.getUserByPartnerId(partner_id)
      if (!partner)
        return res.json(new ResponseError("Create room chat failed because partner ID is invalid"))

      // Check partner id exists
      const roomIds = await RoomService.getPrivateRoomIds(req.locals.room_joined_ids)
      let isValid = true
      roomIds.forEach((room) => {
        room.member_ids.forEach((item) => {
          if (item.user_id.toString() === partner._id.toString()) {
            isValid = false
            return
          }
        })
      })
      if (!isValid)
        return res.json(new ResponseError("Create room chat failed because partner is duplicate"))

      const room = await RoomService.createPrivateChat({ partner, user: req.locals })
      if (!room) return res.json(new ResponseError("Create room chat failed"))

      const roomRes = await RoomService.getRoomDetail({
        room_id: room._id,
        user: req.locals,
      })
      return res.json(new ResponseData(roomRes, "create room chat successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createGroupChat(req: Express.Request, res: Express.Response) {
    try {
      const user: IUser = req.locals
      const params: CreateGroupChat = req.body
      const memberIds: number[] = _.uniq([...params.member_ids, user.user_id])

      if (memberIds?.length === 1) {
        return res.json(
          new ResponseError("Missing member id, can not create group chat without partner")
        )
      }

      const userIds = await UserService.getUserIds(memberIds)
      if (userIds?.length === 1) {
        return res.json(
          new ResponseError("Missing member id, can not create group chat without partner")
        )
      }

      const room = await RoomService.createGroupChat({
        ...params,
        member_ids: userIds.map((item) => item._id),
      })

      if (!room) return new ResponseError("Create group chat failed")

      const roomRes = await RoomService.getRoomDetail({ room_id: room._id, user: req.locals })
      return res.json(new ResponseData(roomRes, "Create group chat successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomDetail(req: Express.Request, res: Express.Response) {
    try {
      const { room_id } = req.params
      const room = await RoomService.getRoomDetail({ room_id: room_id as any, user: req.locals })
      if (!room)
        return res.json(new ResponseError("Room not found, the room has been deleted or changed"))
      return res.json(new ResponseData(room))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomList(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || 30
      const offset = Number(req.query?.offset) || 0
      const search_term = req.query?.search_term ? req.query?.search_term + "" : ""
      const rooms = await RoomService.getRoomList({
        limit,
        offset,
        search_term,
        room_ids: req.locals?.room_joined_ids || [],
        current_user_id: req.locals._id,
      })
      return res.json(new ResponseData(rooms))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomMembers(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || USERS_LIMIT
      const offset = Number(req.query?.offset) || 0
      const data = await RoomService.getMembersInRoom({
        limit,
        offset,
        room_id: req.params.room_id as any,
      })
      return res.json(new ResponseData(data))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getMessagesInRoom(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || MESSAGES_LIMIT
      const offset = Number(req.query?.offset) || 0
      const { room_id } = req.params

      const messages = await RoomService.getMessagesInRoom({
        limit,
        offset,
        room_id: room_id as any,
      })

      return res.json(new ResponseData(messages))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new RoomController()
