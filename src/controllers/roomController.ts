import Express from "express"
import _ from "lodash"
import { MESSAGES_LIMIT, ROOMS_LIMIT, USERS_LIMIT } from "../constant"
import message from "../models/message"
import MessageService from "../services/messageService"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import { AddMessageUnread, CreateGroupChat, IUser } from "../types"
import { toMessageUnreadCount } from "../utils"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class RoomController {
  async createSingleChat(req: Express.Request, res: Express.Response) {
    try {
      const { user_id } = req.locals
      const { partner_id } = req.body

      if (user_id === partner_id)
        return res.json(new ResponseError("Can not create room failed because missing partner"))

      const partner = await UserService.getUserByPartnerId(partner_id)
      if (!partner)
        return res.json(new ResponseError("Create room chat failed because partner ID is invalid"))

      // Check partner id exists
      const roomIds = await RoomService.getSingleRoomIds(req.locals.room_joined_ids)
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

      const room = await RoomService.createSingleChat({
        partner: partner as any,
        user: req.locals,
      })
      if (!room) return res.json(new ResponseError("Create room chat failed"))

      // Add partner id to user chatted with field
      await UserService.addUserIdsChattedWith({
        user_ids: [req.locals._id, partner._id],
      })

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

      const partnerObjectIds = await UserService.getUserIds(memberIds)
      if (partnerObjectIds?.length === 1) {
        return res.json(
          new ResponseError("Missing member id, can not create group chat without partner")
        )
      }

      const partnerIds = partnerObjectIds.map((item) => item._id)
      const room = await RoomService.createGroupChat({
        ...params,
        member_ids: partnerIds,
      })

      if (!room) return new ResponseError("Create group chat failed")

      await UserService.addUserIdsChattedWith({
        user_ids: partnerIds,
      })
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

  async addMessageUnReadToRoom(req: Express.Request, res: Express.Response) {
    try {
      const messageRes = await MessageService.getMessageRes({
        current_user: req.locals,
        message_id: req.body.message_id,
      })
      if (!messageRes?.message_id) return res.json(new ResponseError("Message not found"))

      const room = await RoomService.addMessageUnreadToRoom({
        message_id: messageRes.message_id,
        room_id: messageRes.room_id,
        user_id: req.locals._id,
      })
      if (!room) return res.json(new ResponseError("Failed to add message unread to room"))

      return res.json(
        new ResponseData(
          {
            message_unread_count: toMessageUnreadCount({
              data: room,
              current_user_id: req.locals._id,
            }),
          },
          "Added message unread to room"
        )
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async clearMessageUnreadFromRoom(req: Express.Request, res: Express.Response) {
    try {
      const data = await RoomService.clearMessageUnreadFromRoom({
        room_id: req.params.room_id as any,
        user_id: req.locals._id,
      })
      if (!data) return res.json(new ResponseError("Failed to clear message unread from room"))

      return res.json(new ResponseData(null, "Cleared message unread from room"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomList(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || ROOMS_LIMIT
      const offset = Number(req.query?.offset) || 0
      const search_term = req.query?.search_term ? req.query?.search_term + "" : ""
      const rooms = await RoomService.getRoomList({
        limit,
        offset,
        search_term,
        room_ids: req.locals?.room_joined_ids || [],
        current_user: req.locals,
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

      const messages = await RoomService.getMessagesByFilter({
        limit,
        offset,
        current_user: req.locals,
        filter: { room_id },
      })

      return res.json(new ResponseData(messages))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getUserJoinedRoomIds(req: Express.Request, res: Express.Response) {
    try {
      return res.json(new ResponseData(req.locals?.room_joined_ids || []))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomMessagesPinned(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || ROOMS_LIMIT
      const offset = Number(req.query?.offset) || 0
      const { room_id } = req.params

      const room = await RoomService.getRoomById(room_id as any)
      const messages = await RoomService.getMessagesByFilter({
        limit,
        offset,
        current_user: req.locals,
        filter: {
          _id: {
            $in: room?.message_pinned_ids || [],
          },
        },
      })
      return res.json(new ResponseData(messages))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new RoomController()
