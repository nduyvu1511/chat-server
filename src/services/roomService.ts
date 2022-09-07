import { ObjectId } from "mongodb"
import Room from "../models/room"
import User from "../models/user"
import Message from "../models/message"
import {
  CreateGroupChatServicesParams,
  CreatePrivateChatServicesParams,
  GetRoomDetailService,
  IRoom,
  IUser,
  ListRes,
  MessageQuery,
  QueryMembersInRoomService,
  QueryRoomServiceParams,
  RoomDetailQueryRes,
  RoomDetailRes,
  RoomMemberWithId,
} from "../types"

export class RoomService {
  async createPrivateChat(params: CreatePrivateChatServicesParams): Promise<IRoom | null> {
    const { partner, user } = params

    const room = new Room({
      room_type: "private",
      room_name: "",
      member_ids: [{ user_id: user._id }, { user_id: partner._id }],
    })

    await room.save()
    await this.saveRoomToUserIds([partner._id, user._id], room._id)

    return (room as any)._doc
  }

  async getPrivateRoomIds(room_ids: string[]): Promise<RoomMemberWithId[]> {
    return await Room.find({
      $and: [{ _id: { $in: room_ids } }, { room_type: "private" }],
    })
      .select(["member_ids"])
      .lean()
  }

  async deleteRoomFromUserIds(user_ids: string[], room_id: string) {
    await Promise.all(
      user_ids.map(async (user_id) => {
        const user = await User.findByIdAndUpdate(user_id, {
          $pull: {
            room_joined_ids: room_id,
          },
        })
        return user
      })
    )
  }

  async createGroupChat(params: CreateGroupChatServicesParams): Promise<IRoom> {
    const { member_ids, room_avatar, room_name } = params

    const room = new Room({
      room_type: "group",
      room_avatar: room_avatar || null,
      room_name: room_name || "",
      member_ids: member_ids?.map((user_id) => ({ user_id })),
    })
    await room.save()
    await this.saveRoomToUserIds(member_ids, room._id)
    return (room as any)._doc
  }

  async saveRoomToUserIds(user_ids: ObjectId[], room_id: ObjectId) {
    await Promise.all(
      user_ids.map(async (user_id) => {
        const user = await User.findByIdAndUpdate(user_id, {
          $addToSet: {
            room_joined_ids: room_id,
          },
        })
        return user
      })
    )
  }

  async getRoomDetail(params: GetRoomDetailService): Promise<RoomDetailQueryRes | null> {
    const room = await Room.findById(params.room_id).lean()
    if (!room) return null

    const messages = await Message.find({ $and: [{}] })
      .populate("User")
      .lean()
    // const messagesQuery: MessageQuery[] = messages.map((item) => ({
    //   ...item,
    //   is_author: true,
    //   author:
    // }))

    // const roomd: RoomDetailQueryRes = {

    // }
    console.log(messages)

    return { ...room, messages } as any
  }

  async getRoomList(params: QueryRoomServiceParams): Promise<ListRes<IRoom[]>> {
    const { limit, offset, search_term, room_ids } = params
    const searchQuery = search_term
      ? {
          room_name: {
            $regex: search_term,
            $options: "i",
          },
        }
      : {}

    const rooms = await Room.find({
      $and: [
        {
          _id: {
            $in: room_ids,
          },
        },
        searchQuery,
      ],
    })
      .limit(limit)
      .skip(offset)

    const total = await Room.countDocuments({
      _id: {
        $in: room_ids,
      },
    })

    return {
      hasMore: rooms.length + offset < total,
      limit,
      offset,
      total,
      data: rooms,
    }
  }

  async getMembersInRoom(params: QueryMembersInRoomService): Promise<ListRes<IUser[]>> {
    const { limit, offset, room_id } = params

    const room = await Room.findById(room_id)
    const filter = {
      _id: {
        $in: room?.member_ids?.map((item) => item.user_id) || [],
      },
    }
    const members = await User.find(filter)
      .limit(limit)
      .skip(offset)
      .select(["_id", "avatar", "user_name", "bio", "date_of_birth", "gender"])
    const total = await Room.countDocuments(filter)

    return {
      hasMore: members.length + offset < total,
      limit,
      offset,
      total,
      data: members,
    }
  }
}

export default new RoomService()
