import Express from "express"
import _ from "lodash"
import { ObjectId } from "mongodb"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import { CreateGroupChatParams, IUser } from "../types"
import { toRoomDetailResponse, toRoomListResponse, toRoomMemberListResponse } from "../utils"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class RoomController {
  async createPrivateChat(req: Express.Request, res: Express.Response) {
    try {
      const { _id } = req.locals
      const { partner_id } = req.body

      if (_id === partner_id)
        return res.json(new ResponseError("Can not create room failed because missing partner"))

      const partner = await UserService.getUserByUserId(partner_id)
      if (!partner)
        return res.json(new ResponseError("Create room chat failed because partner ID is invalid"))

      // Check partner id exists
      const roomIds = await RoomService.getPrivateRoomIds(req.locals.room_joined_ids)
      let isValid = true
      roomIds.forEach((room) => {
        room.member_ids.forEach((item) => {
          if (item.user_id.toString() === partner_id) {
            isValid = false
            return
          }
        })
      })
      if (!isValid)
        return res.json(new ResponseError("Create room chat failed because partner is duplicate"))

      const room = await RoomService.createPrivateChat({ partner, user: req.locals })
      if (!room) return res.json(new ResponseError("Create room chat failed"))

      return res.json(
        new ResponseData(
          {
            ...toRoomDetailResponse({
              ...room,
              messages: [],
              is_online: partner?.is_online,
              offline_at: partner?.offline_at,
            }),
            room_avatar: partner.avatar,
            room_name: partner.user_name,
          },
          "create room chat successfully"
        )
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createGroupChat(req: Express.Request, res: Express.Response) {
    try {
      const user: IUser = req.locals
      const params: CreateGroupChatParams = req.body
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
      return res.json(new ResponseData(toRoomDetailResponse({ ...room, messages: [] })))
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
      })
      return res.json(new ResponseData({ ...rooms, data: toRoomListResponse(rooms.data) }))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomMembers(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || 30
      const offset = Number(req.query?.offset) || 0
      const data = await RoomService.getMembersInRoom({
        limit,
        offset,
        room_id: req.params.room_id as any,
      })
      return res.json(new ResponseData({ ...data, data: toRoomMemberListResponse(data.data) }))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomDetail(req: Express.Request, res: Express.Response) {
    try {
      const { room_id } = req.params
      const room = await RoomService.getRoomDetail({ room_id: room_id as any, user: req.locals })
      if (!room) return res.json(new ResponseError("Room not found"))
      return res.json(room)
      // return res.json(new ResponseData({ ...data, data: toRoomMemberListResponse(data.data) }))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new RoomController()
