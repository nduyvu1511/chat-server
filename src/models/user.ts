import { ObjectId } from "mongodb"
import Mongoose, { Schema } from "mongoose"
import { IUser } from "../types"

const UserSchema = new Schema<IUser>({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: Number,
    required: true,
    unique: true,
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
  avatar: {
    type: String,
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
      _id: false,
    },
  ],
  // field for case single device
  hash_token: {
    type: String,
    default: null,
  },
  device_id: {
    type: String,
    default: null,
  },
  //--------------
  password: {
    type: String,
    default: null,
  },
  message_unread_count: {
    typ: Number,
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
