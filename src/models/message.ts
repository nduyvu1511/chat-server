import Mongoose, { Schema } from "mongoose"
import { IMessage } from "../types"
import Attachment from "./attachment"

const MessageSchema = new Schema<IMessage>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  room_id: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  text: {
    type: String,
    trim: true,
    default: null,
  },
  location: {
    type: {
      lng: String,
      lat: String,
    },
    default: null,
  },
  attachment_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: Attachment,
      _id: false,
      default: [],
    },
  ],
  reply_to: {
    type: {
      message_id: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
      attachment_id: {
        type: Schema.Types.ObjectId,
        ref: "Attachment",
        required: false,
        default: null,
      },
    },
    default: null,
  },
  read_by_user_ids: [
    {
      type: {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        created_at: {
          type: Date,
          required: false,
          default: Date.now,
        },
        _id: false,
      },
      ref: "User",
      default: [],
    },
  ],
  liked_by_user_ids: [
    {
      type: {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        emotion: {
          type: String,
          enum: ["like", "angry", "sad", "laugh", "heart", "wow"],
        },
        _id: false,
      },
      default: [],
    },
  ],
  is_hidden: {
    type: Boolean,
    default: false,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_edited: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  deleted_at: {
    type: Schema.Types.Date,
    default: null,
  },
  updated_at: {
    type: Schema.Types.Date,
    default: null,
  },
})

export default Mongoose.model("Message", MessageSchema)
