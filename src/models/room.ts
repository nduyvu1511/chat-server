import Mongoose, { Schema } from "mongoose"
import { IRoom, LastMessage } from "../types/roomType"

const RoomSchema = new Schema<IRoom>({
  room_name: { type: String, default: "" },
  room_avatar: {
    type: {
      attachment_id: {
        type: Schema.Types.ObjectId,
        ref: "Attachment",
      },
      url: String,
    },
    default: null,
    _id: false,
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
    },
    {
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
    },
    {
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
    },
    {
      _id: false,
    },
  ],
  leader_id: {
    type: String,
    ref: "User",
    default: null,
  },
  last_message: {
    type: {
      message_id: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
      message_text: String,
      is_author: Boolean,
      created_at: {
        type: Schema.Types.Date,
        default: Date.now,
      },
      author: {
        type: {
          author_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          author_name: String,
          author_avatar: String,
        },
      },
    },
    default: null,
  },
  message_pinned_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: [],
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
