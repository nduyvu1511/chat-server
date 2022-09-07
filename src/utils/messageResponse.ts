import { LastMessage, MessageRes, MessagePopulate, MessageReply } from "../types"

export const toMessageResponse = (data: MessagePopulate): MessageRes => {
  let reply_to: MessageReply | null = null

  if (data?.reply_to?.message_id?._id) {
    const { _id: message_id, text: message_text = "", created_at } = data.reply_to.message_id
    const { _id: author_id, avatar = "", user_name } = data.reply_to.message_id.user_id

    reply_to = {
      author: {
        author_avatar: avatar,
        author_name: user_name,
        author_id,
      },
      created_at,
      message_id,
      message_text,
      attachment: data?.reply_to?.attachment_id || null,
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
    is_author: data.is_author,
    is_liked: data.is_liked,
    attachments: data?.attachments || [],
    location: data?.location || null,
    reply_to,
    created_at: data.created_at,
    tag: data?.tags || [],
  }
}

export const toMessageListResponse = (data: MessagePopulate[]): MessageRes[] => {
  return data.map((item) => toMessageResponse(item))
}

export const toLastMessageResponse = (data: MessagePopulate): LastMessage => {
  return {
    message_id: data._id,
    message_text: data.text,
    created_at: data.created_at,
    author: {
      author_avatar: data.user_id?.avatar || "",
      author_id: data.user_id?._id,
      author_name: data.user_id?.user_name || "",
    },
    is_author: data.is_author,
  }
}
