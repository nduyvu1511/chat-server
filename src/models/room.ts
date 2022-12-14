import Mongoose, { Schema } from "mongoose"
import { IRoom } from "../types/roomType"

const RoomSchema = new Schema<IRoom>({
  room_name: { type: String, required: false, default: null },
  room_avatar: {
    type: String,
    default: null,
  },
  room_type: {
    type: String,
    enum: ["group", "single", "admin"],
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
  compounding_car_id: {
    type: Schema.Types.Number,
  },
  member_ids: [
    {
      type: {
        _id: false,
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
        message_unread_ids: [
          {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: [],
            _id: false,
          },
        ],
      },
      required: true,
      min: 2,
    },
  ],
  members_leaved: [
    {
      type: {
        _id: false,
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
  pinned_message_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: [],
      _id: false,
    },
  ],
  is_deleted: {
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
