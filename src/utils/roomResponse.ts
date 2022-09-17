import _ from "lodash"
import { ObjectId } from "mongodb"
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
import { toAttachmentResponse } from "./commonResponse"
import { toLastMessageResponse, toMessageListResponse } from "./messageResponse"

export const toRoomResponse = ({ data, current_user }: ToRoomRepsonse): RoomRes => {
  let room_name = data.room_name || ""
  let room_avatar = data?.room_avatar_id?._id ? toAttachmentResponse(data.room_avatar_id) : null

  if (data.room_type === "single" && data.room_single_member_ids?.[0]?._id) {
    const partner = data.room_single_member_ids.find(
      (item) => item._id.toString() !== current_user._id.toString()
    )
    room_name = partner?.user_name || ""
    room_avatar = partner?.avatar_id ? toAttachmentResponse(partner?.avatar_id) : null
  }

  const message_unread_count: number =
    data.member_ids.find((item) => item.user_id._id.toString() === current_user._id.toString())
      ?.message_unread_ids?.length || 0

  return {
    room_id: data._id,
    room_name,
    room_type: data.room_type,
    room_avatar,
    is_online: toRoomStatus({ data: data.member_ids.map((item) => item.user_id), current_user }),
    offline_at: toRoomOfflineAt({
      current_user_id: current_user._id,
      data: data.member_ids?.map((item) => item.user_id),
    }),
    message_unread_count,
    member_count: data.member_ids?.length || 0,
    member_online_count: toRoomMemberOnlineCount(
      data?.member_ids?.map((item) => item.user_id) || []
    ),
    last_message: data?.last_message_id?._id
      ? toLastMessageResponse({
          data: data.last_message_id,
          current_user,
        })
      : null,
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
  const list = data.map((item) => toRoomResponse({ data: item, current_user }))
  return _.orderBy(list, (item) => item.last_message?.created_at || "", ["desc"])
}

export const toRoomDetailResponse = ({
  data,
  current_user,
}: ToRoomDetailResponse): RoomDetailRes => {
  return {
    member_count: data?.member_ids?.length || 0,
    room_id: data._id,
    room_name: data?.room_name || null,
    room_type: data.room_type,
    room_avatar: data?.room_avatar_id ? toAttachmentResponse(data.room_avatar_id) : null,
    leader_info: data.leader_id ? toRoomMemberResponse(data.leader_id) : null,
    pinned_messages: data?.pinned_message_ids?.length
      ? toMessageListResponse({
          data: data.pinned_message_ids,
          current_user,
        })
      : [],
    messages: data?.message_ids?.length
      ? toMessageListResponse({
          data: data.message_ids,
          current_user,
        })
      : [],
    members: toRoomMemberListResponse(data.member_ids),
    is_online: true,
    offline_at: toRoomOfflineAt({ data: data.member_ids, current_user_id: current_user._id }),
    member_online_count: toRoomMemberOnlineCount(data?.member_ids || []),
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
