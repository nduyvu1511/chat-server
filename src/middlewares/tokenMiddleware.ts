import * as express from "express"
import jwt from "jsonwebtoken"
import ResponseError from "../utils/apiError"

const verifyToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers["authorization"]?.split("Bearer ")[1]

  if (!token) {
    return res.json(new ResponseError("No token provided!", 403, false, null))
  }

  try {
    const authUser = jwt.verify(token, process.env.JWT_SECRET as string)
    req.locals = authUser
    return next()
  } catch (error) {
    return res.json(new ResponseError("Unauthorized Token!", 401, false, null))
  }
}

export { verifyToken }
