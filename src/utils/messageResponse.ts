import {
  LastMessage,
  MessageReply,
  MessageRes,
  ToLastMessageResponse,
  ToMessageListResponse,
  ToMessageResponse,
} from "../types"
import { toAttachmentListResponse, toAttachmentResponse, toTagListResponse } from "./commonResponse"
import { toAuthorMessage } from "./userResponse"

export const toMessageResponse = ({ data, current_user }: ToMessageResponse): MessageRes => {
  let reply_to: MessageReply | null = null

  if (data?.reply_to?.message_id?._id) {
    const { _id: message_id, text: message_text = "", created_at } = data.reply_to.message_id
    reply_to = {
      author: toAuthorMessage(data.reply_to.message_id.user_id),
      created_at,
      message_id,
      message_text,
      attachment: data?.reply_to?.attachment_id
        ? toAttachmentResponse(data.reply_to.attachment_id)
        : null,
    }
  }

  const is_author = data.user_id._id.toString() === current_user._id.toString()

  return {
    message_id: data._id,
    room_id: data.room_id,
    message_text: data?.text || "",
    author: toAuthorMessage(data.user_id),
    like_count: data.liked_by_user_ids?.length,
    is_author,
    is_liked: data.liked_by_user_ids?.some(
      ({ user_id }) => user_id.toString() === current_user._id.toString()
    ),
    attachments: data?.attachment_ids?.length ? toAttachmentListResponse(data?.attachment_ids) : [],
    location: data?.location || null,
    reply_to,
    created_at: data.created_at,
    tags: data?.tag_ids?.length ? toTagListResponse(data.tag_ids) : [],
    is_read: is_author
      ? data?.read_by_user_ids?.length >= 2
      : data?.read_by_user_ids?.some((id) => id.toString() === current_user._id.toString()),
  }
}

export const toMessageListResponse = ({
  data,
  current_user,
}: ToMessageListResponse): MessageRes[] => {
  return data.map((item) => toMessageResponse({ data: item, current_user })).reverse()
}

export const toLastMessageResponse = ({
  current_user,
  data,
}: ToLastMessageResponse): LastMessage => {
  let message_text = data?.text || ""
  if (data) {
    if (data.attachment_ids?.length) {
      message_text = "Hình ảnh"
    } else if (data?.tag_ids?.length) {
      message_text = "Tin nhắn nhanh"
    } else if (data?.location) {
      message_text = "Tọa độ"
    }
  }

  return {
    author_name: data.user_name,
    created_at: data.created_at,
    is_author: current_user._id.toString() === data.user_id.toString(),
    message_id: data.message_id,
    message_text,
  }
}
