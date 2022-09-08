import {
  LastMessage,
  MessageReply,
  MessageRes,
  ToMessageListResponse,
  ToMessageResponse,
} from "../types"
import { toAttachmentListResponse, toAttachmentResponse, toTagListResponse } from "./commonResponse"
import { toAuthorMessage } from "./userResponse"

export const toMessageResponse = ({ data, current_user_id }: ToMessageResponse): MessageRes => {
  let reply_to: MessageReply | null = null
  console.log(data)

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

  return {
    message_id: data._id,
    room_id: data.room_id,
    message_text: data?.text || "",
    author: {
      author_avatar: data?.user_id?.avatar || "",
      author_id: data.user_id?._id,
      author_name: data.user_id?.user_name || "",
    },
    like_count: data.liked_by_user_ids?.length,
    is_author: data.user_id._id.toString() === current_user_id.toString(),
    is_liked: data.liked_by_user_ids?.some(
      ({ user_id }) => user_id.toString() === current_user_id.toString()
    ),
    attachments: data?.attachment_ids?.length ? toAttachmentListResponse(data?.attachment_ids) : [],
    location: data?.location || null,
    reply_to,
    created_at: data.created_at,
    tag: data?.tags_ids?.length ? toTagListResponse(data.tags_ids) : [],
  }
}

export const toMessageListResponse = ({
  data,
  current_user_id,
}: ToMessageListResponse): MessageRes[] => {
  return data.map((item) => toMessageResponse({ data: item, current_user_id }))
}

export const toLastMessageResponse = ({
  current_user_id,
  data,
}: ToMessageResponse): LastMessage => {
  return {
    message_id: data._id,
    message_text: data.text,
    created_at: data.created_at,
    is_author: current_user_id?.toString() === data.user_id._id.toString(),
    author: {
      author_avatar: data.user_id?.avatar || "",
      author_id: data.user_id?._id,
      author_name: data.user_id?.user_name || "",
    },
  }
}
