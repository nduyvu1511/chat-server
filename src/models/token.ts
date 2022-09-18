import Mongoose, { Schema } from "mongoose"
import { REFRESH_TOKEN_EXPIRED_NUMBER } from "../constant"
import { IToken } from "../types"

const TokenSchema = new Schema<IToken>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  token: { type: String, required: true },
  expired_at: {
    type: Schema.Types.Date,
    default: Date.now,
    index: {
      expires: REFRESH_TOKEN_EXPIRED_NUMBER,
    },
  },
})

export default Mongoose.model("Token", TokenSchema)
