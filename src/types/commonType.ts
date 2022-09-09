import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import { UserRole } from "./userType"

export interface ResponseType<T> {
  message: string
  success: boolean
  status_code: number
  data: T
}

export interface QueryCommonParams {
  limit: number
  offset: number
}

export interface ListParams<T> {
  limit: number
  offset: number
  total: number
  data: T
}

export interface ListRes<T> {
  hasMore: boolean
  limit: number
  offset: number
  total: number
  data: T
}

export interface Lnglat {
  lng: string
  lat: string
}

type AttachmentType = "image" | "video" | "voice"

export interface IAttachment {
  _id: ObjectId
  url: string
  thumbnail_url: string
  desc: string
  attachment_type: AttachmentType
  created_at: Date
  updated_at: Date
}

export type AttachmentRes = Pick<IAttachment, "thumbnail_url" | "url" | "attachment_type"> & {
  attachment_id: ObjectId
}

export interface AttachmentId {
  attachment_id: ObjectId
  url: string
}

export interface ServiceQueryListRes<T> {
  total: number
  data: T
}

export interface ITag {
  _id: ObjectId
  text: string
  role: UserRole
  created_at: Date
  updated_at: Date
}

export interface TagRes {
  tag_id: ObjectId
  text: string
}

export type CreateAttachment = Pick<IAttachment, "attachment_type" | "url" | "thumbnail_url"> & {
  desc?: string
}

export type UpdateAttachment = Partial<
  Pick<IAttachment, "attachment_type" | "url" | "thumbnail_url" | "desc" | "updated_at">
> & {
  attachment_id: ObjectId
}

export interface GetTagMessageList extends QueryCommonParams {
  filter: FilterQuery<ITag>
}

export interface CreateTagMessage {
  role: UserRole
  text: string
}

export type UpdateTagMessage = Partial<CreateTagMessage> & {
  tag_id: string
}
