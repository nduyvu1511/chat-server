import Mongoose, { Schema } from "mongoose"
import { IToken } from "../types"

const TokenSchema = new Schema<IToken>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: { type: String, required: true },
  expired_at: {
    type: Schema.Types.Date,
    default: Date.now,
    index: {
      expires: "7d",
    },
  },
})

export default Mongoose.model("Token", TokenSchema)
