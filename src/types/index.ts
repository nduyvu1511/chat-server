import { IMessage } from "./messageType"
import { IRoom } from "./roomType"
import { IUser } from "./userType"

export * from "./roomType"
export * from "./messageType"
export * from "./userType"
export * from "./commonType"

declare global {
  namespace Express {
    interface Request {
      user: IUser
      message: IMessage
      room: IRoom
    }

    type NextFunction = Function
  }
}
