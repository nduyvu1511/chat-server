import { IUser } from "./userType"

export * from "./roomType"
export * from "./messageType"
export * from "./userType"
export * from "./commonType"

declare global {
  namespace Express {
    interface Request {
      locals: any | IUser
    }

    type NextFunction = Function
  }
}
