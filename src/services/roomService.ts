import Room from "../models/room"
import User from "../models/user"
import {
  CreateGroupChatServicesParams,
  CreatePrivateChatServicesParams,
  IRoom,
  QueryRoomParams,
  QueryRoomServiceParams,
} from "../types"

export class RoomService {
  async createPrivateChat(params: CreatePrivateChatServicesParams): Promise<IRoom | null> {
    const { partner, user } = params

    const room = new Room({
      room_type: "private",
      room_avatar: { attachment_id: "", url: partner.avatar },
      room_name: partner.user_name,
      member_ids: [{ user_id: user._id }, { user_id: partner._id }],
    })

    await room.save()
    this.saveRoomToUserIds([partner._id.toString(), user._id.toString()], room._id + "")

    return room
  }

  async saveRoomToUserIds(user_ids: string[], room_id: string) {
    console.log({ user_ids })
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

  async createGroupChat(params: CreateGroupChatServicesParams): Promise<IRoom | null> {
    const { member_ids, room_avatar, room_name } = params
    const memberIds = member_ids.map((item) => ({ user_id: item._id }))
    const room = new Room({
      room_type: "group",
      room_avatar: { attachment_id: "", url: room_avatar },
      room_name,
      member_ids: memberIds,
    })

    this.saveRoomToUserIds(
      memberIds.map(({ user_id }) => user_id),
      room._id + ""
    )
    return room
  }

  async getRoomList(params: QueryRoomServiceParams): Promise<IRoom[]> {
    const { limit, offset, search_term, room_ids } = params

    const roomList = await Room.find({
      _id: {
        $in: room_ids,
      },
    })
      .limit(limit)
      .skip(offset)
      

    return roomList
  }
}

export default new RoomService()
