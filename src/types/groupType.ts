import { AttachmentType } from "./messageType"

export interface IGroup {
  name: string
  avatar: {
    attachment_id: string
    url: string
  }
  type: string
  member_ids: string
  members_leaved_date: string
  leader_member_id: number
  last_message?: {
    message_id: string
    type: AttachmentType
  }
  message_pinned_ids: string[]
  created_at: number
  members_leaved: {
    member_id: number
    leaved_at: number
  }
}
