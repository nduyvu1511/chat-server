import { ObjectId } from "mongodb"

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
  _id: string
  url: string
  thumbnail_url: string
  desc: string
  attachment_type: AttachmentType
  created_at: Date
}

export type AttachmentRes = Pick<IAttachment, "_id" | "thumbnail_url" | "url">

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
  created_at: Date
  updated_at: Date
}

export interface TagRes {
  tag_id: ObjectId
  text: string
}
