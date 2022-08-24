import Mongoose, { Schema } from "mongoose"
import { IGroup } from "../types/groupType"

const GroupSchema = new Schema<IGroup>({
  name: { type: String, trim: true },
  avatar: {
    attachment_id: Number,
    url: String,
    default: undefined,
    _id: false,
  },
  type: {
    type: String,
    enum: ["group", "private", "admin"],
    required: true,
  },
  member_ids: [
    {
      user_id: {
        type: Number,
        ref: "User",
        unique: true,
      },
      joined_at: {
        type: Number,
        default: Date.now,
      },
      required: true,
      minlength: 2,
    },
    { _id: false },
  ],
  members_leaved: [
    {
      member_id: {
        type: Number,
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
    Type: Number,
    ref: "User",
    default: undefined,
  },
  last_message: {
    type: {
      message_id: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
      type: {
        type: String,
        enum: ["image", "video", "voice"],
        lowercase: true,
      },
    },
    default: undefined,
  },
  message_pinned_ids: [
    {
      type: String,
      ref: "Message",
      default: [],
    },
  ],
  created_at: {
    type: Number,
    default: Date.now,
  },
})

export default Mongoose.model("Group", GroupSchema)
