import { IMessage, LastMessage, MessageQuery, MessageRes } from "../types"

export const toMessageResponse = (data: MessageQuery): MessageRes => {
  return {
    message_id: data._id,
    room_id: data.room_id,
    message_text: data?.text || "",
    author: {
      author_avatar: data?.author?.avatar || "",
      author_id: data.author._id,
      author_name: data.author.user_name,
    },
    like_count: data.like_count,
    is_author: data.is_author,
    is_liked: data.is_liked,
    attachments: data?.attachments || [],
    location: data?.location || null,
    reply_to: data?.reply_to || null,
    created_at: data.created_at,
    tag: data?.tags || [],
  }
}

export const toMessageListResponse = (data: MessageQuery[]): MessageRes[] => {
  return data.map((item) => toMessageResponse(item))
}

export const toLastMessageResponse = (data: IMessage): LastMessage => {
  return {
    message_id: data._id,
    room_id: data.room_id,
    content: data.text,
    created_at: data.created_at,
  }
}
