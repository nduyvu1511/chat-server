import Mongoose, { Schema } from "mongoose"
import { IUser } from "../types"

const UserSchema = new Schema<IUser>({
  user_id: {
    type: Number,
    unique: true,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "no_info"],
    default: false,
    required: false,
  },
  role: {
    type: String,
    enum: ["customer", "active_driver", "admin", "in_active_driver"],
    required: true,
  },
  avatar: String,
  bio: {
    type: String,
    default: "",
  },
  blocked_user_ids: [
    {
      type: Number,
      unique: true,
      ref: "User",
    },
  ],
  date_of_birth: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  group_joined_ids: [
    {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true,
      ref: "Group",
      default: [],
    },
  ],
  messages_unread: [
    {
      groups: {
        type: {
          group_id: Schema.Types.ObjectId,
          message_ids: [
            { type: Schema.Types.ObjectId, unique: true, required: true, ref: "Message" },
          ],
        },
        unique: true,
        required: true,
        ref: "Group",
      },

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
  is_online: Boolean,
  offline_at: {
    type: Number,
    default: Date.now,
  },
  group_blocked_noti_ids: [{ type: String, ref: "Group", default: [] }],
})

export default Mongoose.model("User", UserSchema)
