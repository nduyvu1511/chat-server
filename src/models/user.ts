import { ObjectId } from "mongodb"
import Mongoose, { Schema } from "mongoose"
import { IUser } from "../types"
import Attachment from "./attachment"

const UserSchema = new Schema<IUser>({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: Number,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
    minlength: 1,
  },
  gender: {
    type: String,
    enum: ["male", "female", "no_info", ""],
    default: "",
  },
  role: {
    type: String,
    enum: ["customer", "car_driver", "admin"],
    required: true,
  },
  avatar_id: {
    type: Schema.Types.ObjectId,
    ref: Attachment,
    default: null,
  },
  bio: {
    type: String,
    default: "",
  },
  blocked_user_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  date_of_birth: {
    type: String,
    default: "",
  },
  room_joined_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room",
      default: [],
    },
  ],
  user_chatted_with_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
    { _id: false },
  ],
  password: {
    type: String,
    min: 8,
    default: null,
  },
  message_unread_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  is_online: {
    type: Boolean,
    default: false,
  },
  offline_at: {
    type: Date,
    default: null,
  },
  room_blocked_noti_ids: [{ type: ObjectId, ref: "Room", default: [] }],
  socket_id: { type: String, default: null },
})

export default Mongoose.model("User", UserSchema)
