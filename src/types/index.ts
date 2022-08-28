export * from "./roomType"
export * from "./messageType"
export * from "./userType"
export * from "./commonType"

declare global {
  namespace Express {
    interface Request {
      locals: any
    }

    type NextFunction = Function
  }
}
