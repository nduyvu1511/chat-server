import Express from "express"
import _ from "lodash"
import { socket } from "../app"
import log from "../config/logger"
import { isObjectID, MESSAGES_LIMIT, ROOMS_LIMIT, USERS_LIMIT } from "../constant"
import MessageService from "../services/messageService"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import { CreateGroupChat, createSingleChat, IUser, UpdateRoomInfo } from "../types"
import { toMessageUnreadCount } from "../utils"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class RoomController {
  async createSingleChat(req: Express.Request, res: Express.Response) {
    try {
      const { user_id } = req.user
      const bodyParams: createSingleChat = req.body
      const { partner_id } = bodyParams as any

      // Get partner
      const partner = isObjectID(partner_id)
        ? await UserService.getUserById(partner_id)
        : await UserService.getUserByPartnerId(partner_id)
      if (!partner)
        return res.json(new ResponseError("Create room chat failed because partner ID is invalid"))

      // Check partner and user already has room
      const r_id = await RoomService.getRoomIdByUserId({
        compounding_car_id: bodyParams.compounding_car_id,
        partner_id: partner._id,
        room_joined_ids: req.user.room_joined_ids as any[],
      })
      if (r_id) {
        const roomRes = await RoomService.getRoomDetail({
          room_id: r_id,
          user: req.user,
        })

        return res.json(new ResponseData(roomRes))
      }

      if (user_id === partner_id || req.user?._id.toString() === partner_id.toString())
        return res.json(new ResponseError("Can not create room failed because missing partner"))

      const room = await RoomService.createSingleChat({
        partner: partner as any,
        user: req.user,
        compounding_car_id: bodyParams.compounding_car_id,
      })
      if (!room) return res.json(new ResponseError("Create room chat failed"))

      const roomRes = await RoomService.getRoomDetail({
        room_id: room._id,
        user: req.user,
      })

      if (!roomRes) return res.json(new ResponseError("Room not found"))

      if (partner?.socket_id) {
        socket?.to(partner.socket_id).emit("create_room", roomRes)
      }

      return res.json(new ResponseData(roomRes, "create room chat successfully"))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async createGroupChat(req: Express.Request, res: Express.Response) {
    try {
      const user: IUser = req.user
      const params: CreateGroupChat = req.body
      const memberIds: number[] = _.uniq([...params.member_ids, user.user_id])

      if (await RoomService.getRoomByCompoundingCarId(params.compounding_car_id)) {
        return res.json(new ResponseError("This compounding car already contain room chat"))
      }

      if (memberIds?.length < 2) {
        return res.json(new ResponseError("Group chat must has atleast two members"))
      }

      const partnerObjectIds = await UserService.getUserIds(memberIds)
      if (partnerObjectIds?.length < 2) {
        return res.json(new ResponseError("Group chat must has atleast two members"))
      }

      const partnerIds = partnerObjectIds.map((item) => item._id)
      const room = await RoomService.createGroupChat({
        ...params,
        member_ids: partnerIds,
      })

      if (!room) return new ResponseError("Create group chat failed")

      const roomRes = await RoomService.getRoomDetail({ room_id: room._id, user: req.user })

      // Emit to client online and except the sender
      partnerObjectIds.forEach((item) => {
        if (item._id.toString() !== user._id.toString() && item?.socket_id) {
          socket?.to(item.socket_id)?.emit("create_room", roomRes)
        }
      })

      return res.json(new ResponseData(roomRes, "Create group chat successfully"))
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async getRoomDetail(req: Express.Request, res: Express.Response) {
    try {
      const { room_id } = req.params
      const room = await RoomService.getRoomDetail({ room_id: room_id as any, user: req.user })
      if (!room)
        return res.json(new ResponseError("Room not found, the room has been deleted or changed"))

      if (!room.members?.data?.some((item) => item.user_id.toString() === req.user._id.toString()))
        return res.json(new ResponseError("You are not in this room, so you can not get detail"))

      return res.json(new ResponseData(room))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async softDeleteRoom(req: Express.Request, res: Express.Response) {
    try {
      const room = await RoomService.softDeleteRoom(req.room)
      if (!room) return res.json(new ResponseError("Failed to soft delete room"))

      setTimeout(async () => {
        const users = await RoomService.getSocketIdsFromRoom(room._id.toString())
        users.forEach((item) => {
          if (item?.socket_id && item.user_id.toString() !== req.user._id.toString()) {
            socket?.to(item.socket_id)?.emit("delete_room", room._id)
          }
        })
      }, 0)

      return res.json(new ResponseData({ room_id: req.params.room_id }, "Soft deleted room"))
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async softDeleteRoomsByCompoundingCarId(req: Express.Request, res: Express.Response) {
    try {
      const compounding_car_id = Number(req.params.compounding_car_id)
      const socketIds = await RoomService.softDeleteRoomsByCompoundingCarId({
        compounding_car_id,
        current_user_id: req.user._id,
      })

      if (socketIds === undefined)
        return res.json(new ResponseError("This compounding car does not contain any room chat"))

      socketIds?.forEach((id) => {
        socket?.to(id).emit("delete_room_by_compounding_car", compounding_car_id)
      })

      return res.json(new ResponseData({ compounding_car_id }, "Soft deleted room"))
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async restoreSoftDeleteRoomByCompoundingCarId(req: Express.Request, res: Express.Response) {
    try {
      const status = await RoomService.restoreSoftDeleteRoom({
        compounding_car_id: Number(req.params.compounding_car_id),
      })
      if (!status) return res.json(new ResponseError("Failed to soft delete room"))

      return res.json(new ResponseData({ room_id: req.params.room_id }, "Soft deleted room"))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async restoreSoftDeleteRoom(req: Express.Request, res: Express.Response) {
    try {
      const status = await RoomService.restoreSoftDeleteRoom({ _id: req.params.room_id })
      if (!status) return res.json(new ResponseError("Failed to restore this room"))

      return res.json(new ResponseData({ room_id: req.params.room_id }, "Restore deleted room"))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async addMessageUnReadToRoom(req: Express.Request, res: Express.Response) {
    try {
      const messageRes = await MessageService.getMessageRes({
        current_user: req.user,
        message_id: req.body.message_id,
      })
      if (!messageRes?.message_id) return res.json(new ResponseError("Message not found"))

      const room = await RoomService.addMessageUnreadToRoom({
        message_id: messageRes.message_id,
        room_id: messageRes.room_id,
        user_id: req.user._id,
      })
      if (!room) return res.json(new ResponseError("Failed to add message unread to room"))

      return res.json(
        new ResponseData(
          {
            message_unread_count: toMessageUnreadCount({
              data: room,
              current_user_id: req.user._id,
            }),
          },
          "Added message unread to room"
        )
      )
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async clearMessageUnreadFromRoom(req: Express.Request, res: Express.Response) {
    try {
      const data = await RoomService.clearMessageUnreadFromRoom({
        room_id: req.params.room_id as any,
        user_id: req.user._id,
      })
      if (!data) return res.json(new ResponseError("Failed to clear message unread from room"))

      return res.json(
        new ResponseData({ message_unread_count: 0 }, "Cleared message unread from room")
      )
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async leaveRoom(req: Express.Request, res: Express.Response) {
    try {
      const { room, user } = req
      if (room.room_type === "single")
        return res.json(new ResponseError("This is single chat room, so you can not leave"))

      if (!room.member_ids?.some((item) => item.user_id.toString() === user._id.toString()))
        return res.json(new ResponseError("You are not belong to this room"))

      const socketIds = await RoomService.deleteMemberFromRoom({ user, room })

      if (socketIds === undefined)
        return res.json(new ResponseError("Failed to delete member from room"))

      const response = { user_id: user?._id, room_id: room?._id }
      socketIds.forEach((id) => {
        socket?.to(id)?.emit("member_leave_room", response)
      })

      return res.json(new ResponseData(response, "Leave room successfully"))
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async joinRoom(req: Express.Request, res: Express.Response) {
    try {
      const { user, room } = req

      if (room.room_type === "single")
        return res.json(new ResponseError("This is single room chat, so you can not join in"))

      if (room?.member_ids?.some((item) => item.user_id?.toString() === user._id.toString()))
        return res.json(new ResponseError("You are already in this room"))

      const socketIds = await RoomService.addMemberToRoom({ user, room })
      if (socketIds === undefined) return res.json(new ResponseError("Failed to join room"))

      const response = { user_id: user?._id, room_id: room?._id }
      socketIds.forEach((id) => {
        socket?.to(id)?.emit("member_join_room", response)
      })

      return res.json(new ResponseData(response, "Joined room successfully"))
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async getRoomList(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || ROOMS_LIMIT
      const offset = Number(req.query?.offset) || 0
      const search_term = req.query?.search_term ? req.query?.search_term + "" : ""
      const room_type = req.query?.room_type + "" || undefined
      const rooms = await RoomService.getRoomList({
        limit,
        offset,
        search_term,
        room_ids: req.user?.room_joined_ids || [],
        current_user: req.user,
        room_type: room_type as any,
      })
      return res.json(new ResponseData(rooms))
    } catch (error) {
      log.error(error)

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
      log.error(error)

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
        current_user: req.user,
        filter: { room_id },
      })

      return res.json(new ResponseData(messages))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async updateRoomInfo(req: Express.Request, res: Express.Response) {
    try {
      const { room_id } = req.params
      const params: UpdateRoomInfo = req.body

      const room = await RoomService.updateRoomInfo({
        room_avatar: params?.room_avatar,
        room_name: params?.room_name,
        room_id,
      })

      if (!room) return res.json(new ResponseError("Failed to update room info"))

      return res.json(new ResponseData(room))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async getUserJoinedRoomIds(req: Express.Request, res: Express.Response) {
    try {
      return res.json(new ResponseData(req.user?.room_joined_ids || []))
    } catch (error) {
      log.error(error)

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
        current_user: req.user,
        filter: {
          _id: {
            $in: room?.pinned_message_ids || [],
          },
        },
      })
      return res.json(new ResponseData(messages))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async pinMessageToRoom(req: Express.Request, res: Express.Response) {
    try {
      const { message_id } = req.body

      const message = await MessageService.getMessageById(message_id as any)
      if (!message) return res.json(new ResponseError("Message not found"))

      const room = await RoomService.pinMessageToRoom(message)
      if (!room) return res.json(new ResponseError("Failed to pin message to room"))

      const messageRes = await MessageService.getMessageRes({
        current_user: req.user,
        message_id,
      })

      return res.json(new ResponseData(messageRes))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }

  async deleteMessagePinnedFromRoom(req: Express.Request, res: Express.Response) {
    try {
      const { message_id } = req.params
      const message = await MessageService.getMessageById(message_id as any)
      if (!message) return res.json(new ResponseError("Message not found"))
      const room = await RoomService.deleteMessagePinnedFromRoom(message)
      if (!room) return res.json(new ResponseError("Failed to pin message to room"))

      return res.json(new ResponseData({ message_id: message._id }))
    } catch (error) {
      log.error(error)

      return res.status(400).send(error)
    }
  }
}

export default new RoomController()
