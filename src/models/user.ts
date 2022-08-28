import Mongoose, { Schema } from "mongoose"
import { IUser } from "../types"

const UserSchema = new Schema<IUser>({
  phone: {
    type: String,
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
    enum: ["customer", "active_driver", "admin", "in_active_driver"],
    required: true,
  },
  avatar: { type: String, default: "" },
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
  password: {
    type: String,
    required: true,
    min: 8,
  },
  messages_unread: [
    {
      room_id: {
        type: Schema.Types.ObjectId,
        ref: "Room",
      },
      message_ids: [{ type: Schema.Types.ObjectId, ref: "Message" }],
      default: [],
    },
    {
      _id: false,
    },
  ],
  created_at: {
    type: Number,
    default: Date.now,
  },
  updated_at: {
    type: Number,
    default: Date.now,
  },
  is_online: {
    type: Boolean,
    default: true,
  },
  offline_at: {
    type: Number,
    default: null,
  },
  room_blocked_noti_ids: [{ type: String, ref: "Room", default: [] }],
})

export default Mongoose.model("User", UserSchema)
