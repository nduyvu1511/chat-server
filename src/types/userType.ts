import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import { AttachmentRes, IAttachment } from "./attachmentType"
import { QueryCommonParams } from "./commonType"

export interface IUser {
  _id: ObjectId
  user_name: string
  role: UserRole
  avatar_id?: ObjectId
  password: string
  bio?: string
  phone: string
  user_id: number
  date_of_birth?: string
  blocked_user_ids: number[]
  gender?: Gender
  user_chatted_with_ids: ObjectId[]
  room_joined_ids: string[]
  message_unread_count: number
  created_at: Date
  updated_at: Date
  is_online: boolean
  offline_at: Date
  room_blocked_noti_ids: string[]
  socket_id: string
}

export type UserPopulate = Omit<IUser, "avatar_id"> & {
  avatar_id: IAttachment
}

/**
 * @openapi
 * components:
 *  schema:
 *    UserListRes:
 *      type: object
 *      required:
 *       offset
 *       limit
 *       total
 *       data
 *      properties:
 *        has_more:
 *         type: boolean
 *        limit:
 *         type: number
 *        offset:
 *         type: number
 *        total:
 *         type: number
 *        data:
 *          type: array
 *          items:
 *           $ref: '#components/schema/UserRes'
 */

/**
 * @openapi
 * components:
 *  schema:
 *    CreateUserRes:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *          example: 631d56c54a20bef82e479f0d
 *        user_name:
 *          type: string
 *        avatar:
 *          type: string
 *          $ref: '#/components/schema/AttachmentRes'
 *        bio:
 *          type: string
 *        date_of_birth:
 *          type: date
 *          format: YYYY-MM-DD
 *          example: 2000-11-15
 *          regex: /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
 *        gender:
 *          type: string
 *          enum: [male, female, no_info]
 *        is_online:
 *          type: boolean
 *        offline_at:
 *          type: date
 *          format: YYYY-MM-DD
 *          example: 2000-11-15
 *        role:
 *          type: string
 *          enum: [customer, driver, admin]
 *        phone:
 *          type: string
 *          regex: /((^(\+84|84|0|0084){1})(3|5|7|8|9))+([0-9]{8})$/
 *          default: '0977066211'
 *        access_token:
 *          type: string
 *          summary: Là token dùng để gọi tất cả request về sau
 *        refresh_token:
 *          type: string
 *          summary: Là token gọi để generate ra 1 access token mới trong trường hợp access token hết hạn
 */

/**
 * @openapi
 * components:
 *  schema:
 *    TokenRes:
 *      type: object
 *      properties:
 *        access_token:
 *          type: string
 *          summary: Là token dùng để gọi tất cả request về sau
 *        refresh_token:
 *          type: string
 *          summary: Là token gọi để generate ra 1 access token mới trong trường hợp access token hết hạn
 */

/**
 * @openapi
 * components:
 *  schema:
 *    UserRes:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *          example: 631d56c54a20bef82e479f0d
 *        user_name:
 *          type: string
 *        avatar:
 *          type: string
 *          $ref: '#/components/schema/AttachmentRes'
 *        bio:
 *          type: string
 *        date_of_birth:
 *          type: date
 *          format: YYYY-MM-DD
 *          example: 2000-11-15
 *          regex: /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
 *        gender:
 *          type: string
 *          enum: [male, female, no_info]
 *        is_online:
 *          type: boolean
 *        offline_at:
 *          type: date
 *          format: YYYY-MM-DD
 *          example: 2000-11-15
 *        role:
 *          type: string
 *          enum: [customer, driver, admin]
 *        room_id:
 *          type: boolean
 *          required: false
 *          summary: Nếu đã từng tạo nhóm chat đơn với người này thì sẽ có giá trị
 *        is_yourself:
 *          type: boolean
 *          required: false
 *        phone:
 *          type: string
 *          regex: /((^(\+84|84|0|0084){1})(3|5|7|8|9))+([0-9]{8})$/
 *          default: '0977066211'
 */
export type UserRes = Pick<
  IUser,
  "bio" | "date_of_birth" | "gender" | "is_online" | "offline_at" | "role" | "phone" | "user_name"
> & {
  user_id: ObjectId
  avatar: AttachmentRes
  socket_id: string
  room_id?: ObjectId
  is_yourself?: boolean
  message_unread_count?: number
}

/**
 * @openapi
 * components:
 *  schema:
 *    CreateUserRes:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *          default: 631d56c54a20bef82e479f0d
 *        user_name:
 *          type: string
 *        avatar:
 *          type: string
 *          $ref: '#/components/schema/AttachmentRes'
 *        bio:
 *          type: string
 *        date_of_birth:
 *          type: date
 *          format: YYYY-MM-DD
 *        gender:
 *          type: string
 *          enum: [male, female, no_info]
 *        is_online:
 *          type: boolean
 *        offline_at:
 *          type: date
 *          format: YYYY-MM-DD
 *        role:
 *          type: string
 *          enum: [customer, driver, admin]
 *        phone:
 *          type: string
 *          pattern: '((^(\+84|84|0|0084){1})(3|5|7|8|9))+([0-9]{8})$'
 *          default: '0977066211'
 */

export type UserData = UserRes & {
  user_chatted_with_ids: string[]
  room_joined_ids: string[]
  room_blocked_noti_ids: string[]
}

export type CreateUserParams = Pick<
  IUser,
  "user_name" | "date_of_birth" | "gender" | "role" | "bio" | "phone" | "user_id"
> & {
  user_id: string
  avatar: string
  // password: string
}

export type UpdateProfile = Partial<
  Pick<IUser, "user_name" | "date_of_birth" | "gender" | "bio"> & {
    avatar: string
  }
>

export type UpdateProfileService = UpdateProfile & { user: IUser }

export type GetTokenParams = Pick<IUser, "user_id" | "phone">

export type UserRole = "customer" | "car_driver" | "admin"

export type Gender = "male" | "female" | "no_info" | ""

export type UserLoginRes = UserRes & { access_token: string; refresh_token: string }

export type changeUserStatusParams = Pick<IUser, "is_online"> & {
  user_id: string
  socket_id: string
}

export type BlockUserStatus = "block" | "unblock"
export type BlockOrUnBlockUserParams = {
  user_id: string
  partner_id: string
  status: BlockUserStatus
}

export type getUserBlockListParams = Pick<IUser, "blocked_user_ids"> & QueryCommonParams

export interface LoginParams {
  phone: string
  password: string
}

export interface LoginSocket {
  socket_id: string
}

/**
 * @openapi
 * components:
 *  schema:
 *    Register:
 *      type: object
 *      required:
 *        - user_id
 *        - phone
 *        - password
 *        - role
 *      properties:
 *        user_id:
 *          type: string
 *          summary: Lấy ID từ partner id của server Exxe
 *        phone:
 *          type: string
 *        password:
 *          type: string
 *        role:
 *          type: string
 *          enum: [car_driver, customer]
 */
export type RegisterParams = Pick<IUser, "user_id" | "phone" | "password" | "role">

export interface CreatePasswordParams {
  new_password: string
  confirm_new_password: string
}

export interface ChangePasswordParams extends CreatePasswordParams {
  current_password: string
}

export type CreatePasswordServiceParams = CreatePasswordParams & {
  _id: string
}

export type ChangePasswordServiceParams = ChangePasswordParams & {
  _id: string
}

export type GetUserByFilter = Partial<QueryCommonParams> & {
  filter: FilterQuery<IUser>
}

export type GetUsersLiked = Partial<QueryCommonParams> & {
  filter: FilterQuery<IUser>
}

export type GetUsersLikedMessage = Partial<QueryCommonParams> & {
  message_id: ObjectId
}

export interface ChangeUserStatusBySocketId {
  socket_id: string
  is_online: boolean
}

export interface AddUserSocketId {
  user_id: ObjectId
  socket_id: string
}

export interface SetUserIdsChattedWith {
  user_ids: ObjectId[]
  type: "add" | "delete"
}

export interface LoginToSocket {
  socket_id: string
  user_id: ObjectId
  // socket: Socket<any>
}

export interface UserSocketId {
  user_id: ObjectId
  socket_id: string
  room_joined_ids: string[]
}

export interface RequestRefreshToken {
  refresh_token: string
  user: IUser
}

export interface CountMessageUnread {
  user_id: ObjectId
  room_ids: ObjectId[]
}

export interface TopMember {
  user_id: string
  user_avatar: string
  user_name: string
  is_online: boolean
}

export type FriendStatusRes = {
  user_id: ObjectId
  room_ids: string[]
}
