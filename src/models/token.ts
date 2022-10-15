import Mongoose, { Schema } from "mongoose"
import { REFRESH_TOKEN_EXPIRED } from "../constant"
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
    expires: REFRESH_TOKEN_EXPIRED,
  },
})

export default Mongoose.model("Token", TokenSchema)
