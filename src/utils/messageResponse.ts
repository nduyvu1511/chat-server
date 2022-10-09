import {
  LastMessage,
  MessagePopulate,
  MessageReply,
  MessageRes,
  ToLastMessageResponse,
  ToMessageListResponse,
  ToMessageResponse,
} from "../types"
import { toAttachmentListResponse } from "./commonResponse"
import { toAuthorMessage } from "./userResponse"

export const toMessageResponse = ({ data, current_user }: ToMessageResponse): MessageRes => {
  let reply_to: MessageReply | null = null

  if (data?.reply_to?.message_id?._id) {
    const { _id: message_id, text, created_at } = data.reply_to.message_id

    reply_to = {
      author: toAuthorMessage(data.reply_to.message_id.user_id),
      created_at,
      message_id,
      message_text: toMessageDescription(data.reply_to.message_id as any),
      message_type: data?.attachment_ids?.length
        ? "attachment"
        : data?.location
        ? "location"
        : "text",
    }
  }

  const is_author = data.user_id._id.toString() === current_user._id.toString()
  const your_reaction =
    data?.liked_by_user_ids?.length > 0
      ? data?.liked_by_user_ids?.find(
          (item) => item.user_id.toString() === current_user._id.toString()
        )?.emotion || null
      : null
  const reactions = data?.liked_by_user_ids?.length
    ? data?.liked_by_user_ids?.map((item) => item.emotion)
    : []

  return {
    message_id: data._id,
    room_id: data.room_id,
    message_text: data?.text || "",
    author: toAuthorMessage(data.user_id),
    reaction_count: data.liked_by_user_ids?.length,
    is_author,
    is_read: is_author
      ? data?.read_by_user_ids?.length >= 2
      : data?.read_by_user_ids?.some(
          (item) => item?.user_id?.toString() === current_user._id.toString()
        ),
    your_reaction,
    reactions,
    attachments: data?.attachment_ids?.length ? toAttachmentListResponse(data?.attachment_ids) : [],
    location: data?.location || null,
    reply_to,
    created_at: data.created_at,
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
  return {
    author_name: data.user_name,
    created_at: data.created_at,
    is_author: current_user._id.toString() === data.user_id.toString(),
    message_id: data.message_id,
    message_text: toMessageDescription(data as any),
  }
}

const toMessageDescription = (message: MessagePopulate): string => {
  if (message.attachment_ids?.length) {
    return "Hình ảnh"
  } else if (message?.location) {
    return "Vị trí"
  }
  return message?.text || ""
}
