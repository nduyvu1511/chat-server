import Mongoose, { Schema } from "mongoose"
import { IRoom } from "../types/roomType"

const RoomSchema = new Schema<IRoom>({
  room_name: { type: String, default: "" },
  room_avatar_id: {
    type: Schema.Types.ObjectId,
    ref: "Attachment",
    default: null,
  },
  room_type: {
    type: String,
    enum: ["group", "private", "admin"],
    required: true,
  },
  message_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: [],
      _id: false,
    },
  ],
  member_ids: [
    {
      type: {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joined_at: {
          type: Schema.Types.Date,
          default: Date.now,
          required: false,
        },
      },
      required: true,
      min: 2,
      _id: false,
    },
  ],
  members_leaved: [
    {
      type: {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        leaved_at: {
          type: Number,
          default: Date.now,
        },
      },
      default: [],
      _id: false,
    },
  ],
  leader_id: {
    type: String,
    ref: "User",
    default: null,
  },
  last_message_id: {
    type: Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },
  message_pinned_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: [],
      _id: false,
    },
  ],
  is_expired: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  updated_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  deleted_at: {
    type: Schema.Types.Date,
  },
})

export default Mongoose.model("Room", RoomSchema)
