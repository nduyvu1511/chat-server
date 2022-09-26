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
  has_more: boolean
  limit: number
  offset: number
  total: number
  data: T
}

export interface Lnglat {
  lng: string
  lat: string
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

export interface IToken {
  token: string
  user_id: ObjectId
  expired_at: Date
}
