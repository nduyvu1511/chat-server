import Mongoose, { Schema } from "mongoose"
import { IRoom, LastMessage } from "../types/roomType"

const MemberId = new Schema(
  {
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
  {
    _id: false,
  }
)

const LastMessage = new Schema<LastMessage>(
  {
    message_id: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    content: String,
    created_at: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
)

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
  ],
  member_ids: [
    {
      type: MemberId,
      required: true,
      min: 2,
    },
  ],
  members_leaved: [
    {
      member_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      leaved_at: {
        type: Number,
        default: Date.now,
      },
      default: [],
    },
  ],
  leader_member_id: {
    Type: Schema.Types.ObjectId,
    required: false,
  },
  last_message: {
    type: LastMessage,
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
