import { ObjectId } from "mongodb"
import { MESSAGES_LIMIT, USERS_LIMIT } from "../constant"
import Message from "../models/message"
import Room from "../models/room"
import User from "../models/user"
import {
  CreateGroupChatServicesParams,
  CreatePrivateChatServices,
  GetMessagesInRoom,
  GetRoomDetailService,
  IRoom,
  IUser,
  ListRes,
  MessagePopulate,
  MessageRes,
  QueryMembersInRoomService,
  QueryRoomServiceParams,
  RoomDetailRes,
  RoomMemberRes,
  RoomMemberWithId,
  RoomQueryDetailRes,
  RoomRes,
} from "../types"
import {
  toListResponse,
  toRoomDetailResponse,
  toRoomListResponse,
  toRoomMemberListResponse,
} from "../utils"
import { toMessageListResponse } from "../utils/messageResponse"

export class RoomService {
  async createPrivateChat(params: CreatePrivateChatServices): Promise<IRoom | null> {
    const { partner, user } = params

    const room = new Room({
      room_type: "private",
      room_name: null,
      member_ids: [{ user_id: user._id }, { user_id: partner._id }],
    })

    await room.save()
    await this.saveRoomToUserIds([partner._id, user._id], room._id)

    return (room as any)._doc
  }

  async createGroupChat(params: CreateGroupChatServicesParams): Promise<IRoom | null> {
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

  async getRoomDetail(params: GetRoomDetailService): Promise<RoomQueryDetailRes | null> {
    const room = await Room.findById(params.room_id).lean()
    if (!room) return null

    // Get members in room
    const usersFilter = {
      _id: {
        $in: room.member_ids?.map((item) => item.user_id),
      },
    }
    const user_count = await User.countDocuments(usersFilter)
    const users: IUser[] = await User.find(usersFilter).lean()

    const messagesFilter = {
      room_id: room._id,
    }
    const messages: MessagePopulate[] = await Message.find(messagesFilter)
      .populate("user_id")
      .lean()
    const message_count = await Message.countDocuments(messagesFilter)

    // Get messages pinned in room
    const messagesPinnedFilter = {
      _id: {
        $in: room.message_pinned_ids,
      },
    }
    const messagesPinned: MessagePopulate[] = await Message.find(messagesPinnedFilter)
      .populate("user_id")
      .lean()
    const message_pinned_count = await Message.countDocuments(messagesPinnedFilter)

    // Get leader room info
    const leaderUser: IUser | null = room?.leader_id ? await User.findById(room.leader_id) : null

    const room_name =
      room.room_type === "private"
        ? users.find((item) => item._id.toString() !== params.user._id.toString())?.user_name || ""
        : room?.room_name

    const data = {
      ...toRoomDetailResponse({
        data: {
          ...room,
          member_ids: users,
          message_ids: messages,
          message_pinned_ids: messagesPinned,
          leader_id: leaderUser || undefined,
          room_avatar_id: undefined,
        },
        current_user_id: params.user._id,
      }),
      room_name,
    }

    return {
      ...data,
      members: toListResponse({
        data: data.members,
        total: user_count,
        limit: USERS_LIMIT,
        offset: 0,
      }),
      messages: toListResponse({
        data: data.messages,
        total: message_count,
        limit: MESSAGES_LIMIT,
        offset: 0,
      }),
      messages_pinned: toListResponse({
        data: data.messages_pinned,
        total: message_pinned_count,
        limit: MESSAGES_LIMIT,
        offset: 0,
      }),
    }
  }

  async getRoomList(params: QueryRoomServiceParams): Promise<ListRes<RoomRes[]>> {
    const { limit, offset, search_term, room_ids, current_user_id } = params
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
      .populate({
        path: "last_message_id",
        model: "Message",
        populate: {
          path: "user_id",
          model: "User",
        },
      })
      .limit(limit)
      .skip(offset)

    const total = await Room.countDocuments({
      _id: {
        $in: room_ids,
      },
      searchQuery,
    })

    return toListResponse<RoomRes[]>({
      limit,
      offset,
      total,
      data: toRoomListResponse({ current_user_id, data: rooms as any }),
    })
    // return {
    //   hasMore: rooms.length + offset < total,
    //   limit,
    //   offset,
    //   total,
    //   data: toRoomListResponse({ current_user_id, data: rooms as any }),
    // }
  }

  async getMembersInRoom(params: QueryMembersInRoomService): Promise<ListRes<RoomMemberRes[]>> {
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
      .select([
        "_id",
        "avatar",
        "user_name",
        "bio",
        "date_of_birth",
        "gender",
        "phone",
        "is_online",
      ])
    const total = await Room.countDocuments(filter)

    return {
      hasMore: members.length + offset < total,
      limit,
      offset,
      total,
      data: toRoomMemberListResponse(members),
    }
  }

  async getMessagesInRoom(params: GetMessagesInRoom): Promise<ListRes<MessageRes[]>> {
    const { limit, offset, room_id } = params

    const messages = await Message.find({ room_id })
      .populate({
        path: "user_id",
        model: "User",
        select: ["user_id", "_id", "user_name", "gender", "phone", "avatar", "is_online", "role"],
      })
      .limit(limit)
      .skip(offset)
      .lean()

    return {
      data: toMessageListResponse(messages as any),
      hasMore: true,
      limit: 1,
      offset: 0,
      total: 0,
    }
  }
}

export default new RoomService()
