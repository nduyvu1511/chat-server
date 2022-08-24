export * from "./groupType"
export * from "./messageType"
export * from "./userType"

declare global {
  namespace Express {
    interface Request {
      locals: any
    }
  }
}
