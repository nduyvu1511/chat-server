import Mongoose, { Schema } from "mongoose"
import { IToken } from "../types"

const TokenSchema = new Schema<IToken>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: { type: String, required: true },
})

export default Mongoose.model("Token", TokenSchema)
