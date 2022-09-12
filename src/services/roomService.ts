import { ObjectId } from "mongodb"
import { MESSAGES_LIMIT, SELECT_USER, USERS_LIMIT } from "../constant"
import Message from "../models/message"
import Room from "../models/room"
import User from "../models/user"
import {
  AttachmentRes,
  CreateGroupChatServicesParams,
  createSingleChatServices,
  GetRoomDetailService,
  IRoom,
  ListRes,
  MessagePopulate,
  MessageRes,
  QueryMembersInRoomService,
  QueryRoomServiceParams,
  RoomMemberRes,
  RoomMemberWithId,
  RoomPopulate,
  RoomQueryDetailRes,
  RoomRes,
  UserPopulate,
} from "../types"
import {
  toAttachmentResponse,
  toListResponse,
  toRoomListResponse,
  toRoomMemberListResponse,
  toRoomMemberResponse,
} from "../utils"
import { toMessageListResponse } from "../utils/messageResponse"
import { GetMessagesByFilter } from "../validators"

class RoomService {
  async createSingleChat(params: createSingleChatServices): Promise<IRoom | null> {
    const { partner, user } = params

    const room = new Room({
      room_type: "single",
      room_name: null,
      member_ids: [{ user_id: user._id }, { user_id: partner._id }],
      room_single_member_ids: [user._id, partner._id],
    })

    const roomRes: IRoom = (await room.save()).toObject()
    await this.saveRoomToUserIds([partner._id, user._id], room._id)
    return roomRes
  }

  async createGroupChat(params: CreateGroupChatServicesParams): Promise<IRoom | null> {
    const { member_ids, room_avatar_id, room_name } = params

    const room = new Room({
      room_type: "group",
      room_avatar_id: room_avatar_id || null,
      room_name: room_name || "",
      member_ids: member_ids?.map((user_id) => ({ user_id })),
    })
    const roomRes: IRoom = (await room.save()).toObject()
    await this.saveRoomToUserIds(member_ids, room._id)
    return roomRes
  }

  async getSingleRoomIds(room_ids: string[]): Promise<RoomMemberWithId[]> {
    return await Room.find({
      $and: [{ _id: { $in: room_ids } }, { room_type: "single" }],
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
    const room: RoomPopulate = await Room.findById(params.room_id).populate("room_avatar_id").lean()
    if (!room?._id) return null

    // Get members in room
    const members = await this.getMembersInRoom({
      limit: USERS_LIMIT,
      offset: 0,
      room_id: room._id,
    })

    // Get messages in room
    const messages = await this.getMessagesByFilter({
      limit: MESSAGES_LIMIT,
      offset: 0,
      current_user: params.user,
      filter: { room_id: room._id },
    })

    // Get messages pinned in room
    const messages_pinned = await this.getMessagesByFilter({
      limit: MESSAGES_LIMIT,
      offset: 0,
      current_user: params.user,
      filter: {
        _id: {
          $in: room.message_pinned_ids,
        },
      },
    })

    // Get leader room info
    const leader_user_info: UserPopulate | null = room?.leader_id
      ? await User.findById(room.leader_id).populate("avatar_id")
      : null

    let room_name: null | string = room?.room_name
    let room_avatar: AttachmentRes = toAttachmentResponse(room?.room_avatar_id as any)
    if (room.room_type === "single") {
      const partner = members.data.find(
        (item) => item.user_id.toString() !== params.user._id.toString()
      )
      if (partner?.user_id) {
        room_name = partner?.user_name || room.room_name || null
        room_avatar = partner?.avatar as any
      }
    }

    return {
      room_id: room._id,
      room_name,
      room_avatar,
      member_count: room.member_ids?.length || 0,
      room_type: room.room_type,
      last_message: null,
      leader_user_info: leader_user_info?._id ? toRoomMemberResponse(leader_user_info) : null,
      created_at: room.created_at,
      members,
      messages,
      messages_pinned,
    }
  }

  async getMembersInRoom(params: QueryMembersInRoomService): Promise<ListRes<RoomMemberRes[]>> {
    const { limit, offset, room_id } = params

    const room = await Room.findById(room_id)
    const filter = {
      _id: {
        $in: room?.member_ids?.map((item) => item.user_id) || [],
      },
    }
    const members: UserPopulate[] = await User.find(filter)
      .populate("avatar_id")
      .limit(limit)
      .skip(offset)
      .select(SELECT_USER)
      .lean()
    const total = await User.countDocuments(filter)

    return toListResponse({ limit, offset, total, data: toRoomMemberListResponse(members) })
  }

  async getRoomList(params: QueryRoomServiceParams): Promise<ListRes<RoomRes[]>> {
    const { limit, offset, search_term, room_ids, current_user } = params
    const searchQuery = {
      $and: [
        {
          _id: {
            $in: room_ids,
          },
        },
        search_term
          ? {
              room_name: {
                $regex: search_term,
                $options: "i",
              },
            }
          : {},
      ],
    }

    const data: RoomPopulate[] = await Room.find(searchQuery)
      .populate({
        path: "last_message_id",
        model: "Message",
        populate: {
          path: "user_id",
          model: "User",
          select: SELECT_USER,
          populate: {
            path: "avatar_id",
            model: "Attachment",
          },
        },
      })
      .populate({ path: "room_avatar_id", model: "Attachment" })
      .populate({
        path: "room_single_member_ids",
        model: "User",
        select: ["_id", "avatar_id", "user_name"],
        populate: {
          path: "avatar_id",
          model: "Attachment",
        },
      })
      .limit(limit)
      .skip(offset)
      .lean()

    const total = await Room.countDocuments(searchQuery)
    return toListResponse({
      limit,
      offset,
      total,
      data: toRoomListResponse({ current_user, data }),
    })
  }

  async getRoomById(room_id: ObjectId): Promise<IRoom | null> {
    return await Room.findById(room_id)
  }

  async getMessagesByFilter(params: GetMessagesByFilter): Promise<ListRes<MessageRes[]>> {
    const { limit, offset, current_user, filter } = params

    const messages: MessagePopulate[] = await Message.find(filter)
      .populate({
        path: "user_id",
        model: "User",
        select: SELECT_USER,
        populate: {
          path: "avatar_id",
          model: "Attachment",
        },
      })
      .populate({
        path: "reply_to.message_id",
        populate: {
          path: "user_id",
          model: "User",
          select: SELECT_USER,
          populate: {
            path: "avatar_id",
            model: "Attachment",
          },
        },
      })
      .populate("reply_to.attachment_id")
      .populate("tag_ids")
      .populate("attachment_ids")
      .limit(limit)
      .skip(offset)
      .sort({ created_at: -1 })
      .lean()

    const total = await Message.countDocuments(filter)

    return toListResponse({
      limit,
      offset,
      total,
      data: toMessageListResponse({ data: messages, current_user }),
    })
  }
}

export default new RoomService()
