import _ from "lodash"
import { ObjectId } from "mongodb"
import log from "../config/logger"
import {
  IRoom,
  IUser,
  RoomDetailRes,
  RoomMemberRes,
  RoomRes,
  ToRoomDetailResponse,
  ToRoomListResponse,
  ToRoomRepsonse,
  ToRoomStatus,
  UserPopulate,
} from "../types"
import { toAttachmentResponse, toDefaultListResponse, toListResponse } from "./commonResponse"
import { toLastMessageResponse, toMessageListResponse } from "./messageResponse"
import { toUserListResponse } from "./userResponse"

export const toRoomResponse = ({ data, current_user }: ToRoomRepsonse): RoomRes => {
  const partner = data.top_members?.find(
    (item) => item.user_id.toString() !== current_user._id.toString()
  )

  let room_name = ""
  if (data.room_type === "single") {
    room_name = partner?.user_name || ""
  } else if (data.room_type === "group") {
    room_name = data?.room_name || data.top_members.map((item) => item.user_name)?.join(", ")
  }

  let room_avatar: string | null = data?.room_avatar || ""
  if (data.room_type === "single") {
    room_avatar = partner?.user_avatar || null
  }

  return {
    room_id: data.room_id,
    compounding_car_id: data?.compounding_car_id || null,
    room_name,
    room_type: data.room_type,
    room_avatar,
    is_online: data.top_members.filter((item) => item.is_online === true)?.length >= 2,
    message_unread_count: data?.message_unread_count?.length || 0,
    member_count: data.member_count,
    last_message: data?.last_message?.message_id
      ? toLastMessageResponse({ current_user, data: data.last_message })
      : null,
    top_members: data.top_members,
  }
}

export const toRoomOfflineAt = ({
  current_user_id,
  data,
}: {
  data: IUser[] | UserPopulate[] | RoomMemberRes[]
  current_user_id: ObjectId
}): Date | null => {
  return (
    _.orderBy(
      [...data].filter(
        (item) => ((item as IUser)._id || item.user_id).toString() !== current_user_id.toString()
      ),
      (item) => item?.offline_at || "",
      ["desc"]
    )[0]?.offline_at || null
  )
}

export const toMessageUnreadCount = ({
  current_user_id,
  data,
}: {
  current_user_id: ObjectId
  data: IRoom
}): number => {
  return (
    data.member_ids?.find((item) => item.user_id.toString() === current_user_id.toString())
      ?.message_unread_ids?.length || 0
  )
}

export const toRoomStatus = ({ current_user, data }: ToRoomStatus): boolean => {
  return data
    .filter((item) => item._id.toString() !== current_user._id.toString())
    .some((item) => item.is_online)
}

export const toRoomListResponse = ({ current_user, data }: ToRoomListResponse): RoomRes[] => {
  try {
    return data.map((item) => toRoomResponse({ data: item, current_user }))
    // return _.orderBy(list, (item) => item.last_message?.created_at || "", ["desc"])
  } catch (error) {
    log.error(error)
    return []
  }
}

export const toRoomDetailResponse = ({
  data,
  current_user,
}: ToRoomDetailResponse): RoomDetailRes => {
  return {
    member_count: data?.member_ids?.data?.length || 0,
    room_id: data._id,
    compounding_car_id: data?.compounding_car_id || null,
    room_name: data?.room_name || null,
    room_type: data.room_type,
    room_avatar: data?.room_avatar_id ? toAttachmentResponse(data.room_avatar_id) : null,
    leader_info: data.leader_id ? toRoomMemberResponse(data.leader_id) : null,
    pinned_messages: data?.pinned_message_ids?.data?.length
      ? toListResponse({
          total: data.pinned_message_ids.total,
          limit: data.pinned_message_ids.limit,
          offset: data.pinned_message_ids.offset,
          data: toMessageListResponse({
            data: data.pinned_message_ids.data,
            current_user,
          }),
        })
      : toDefaultListResponse(),
    messages: data?.message_ids?.data?.length
      ? toListResponse({
          total: data.message_ids.total,
          limit: data.message_ids.limit,
          offset: data.message_ids.offset,
          data: toMessageListResponse({
            data: data.message_ids.data,
            current_user,
          }),
        })
      : toDefaultListResponse(),
    members: data?.member_ids?.data?.length
      ? toListResponse({
          total: data.member_ids.total,
          limit: data.member_ids.limit,
          offset: data.member_ids.offset,
          data: toUserListResponse(data.member_ids.data),
        })
      : toDefaultListResponse(),
    is_online: true,
    offline_at: toRoomOfflineAt({ data: data.member_ids.data, current_user_id: current_user._id }),
    // member_online_count: toRoomMemberOnlineCount(data?.member_ids || []),
  }
}

export const toRoomMemberOnlineCount = (params: { is_online: boolean }[]) => {
  return params.reduce((a, b) => a + (b.is_online ? 1 : 0), 0) || 1
}

export const toRoomMemberResponse = (data: UserPopulate): RoomMemberRes => ({
  user_id: data._id,
  avatar: toAttachmentResponse(data.avatar_id),
  user_name: data?.user_name || "",
  phone: data.phone,
  bio: data?.bio || "",
  date_of_birth: data.date_of_birth || "",
  gender: data?.gender || "",
  is_online: data?.is_online || false,
  offline_at: data?.offline_at || null,
})

export const toRoomMemberListResponse = (data: UserPopulate[]): RoomMemberRes[] => {
  return data.map((item) => toRoomMemberResponse(item))
}
