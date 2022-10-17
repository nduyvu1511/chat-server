import { Socket } from "socket.io"
import { IAttachment } from "./attachmentType"
import { IMessage } from "./messageType"
import { IRoom } from "./roomType"
import { IUser } from "./userType"

export * from "./roomType"
export * from "./messageType"
export * from "./userType"
export * from "./attachmentType"
export * from "./commonType"

declare global {
  namespace socket {
    interface socket {
      socket: Socket
    }
  }

  namespace Express {
    interface Request {
      user: IUser
      message: IMessage
      room: IRoom
      attachment: IAttachment
      partner: IUser
    }

    type NextFunction = Function
  }
}
