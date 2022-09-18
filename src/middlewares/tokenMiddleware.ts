import * as express from "express"
import jwt from "jsonwebtoken"
import log from "../config/logger"
import { IUser } from "../types"
import ResponseError from "../utils/apiError"

const verifyToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  log.info(req.headers["authorization"])
  const token = req.headers["authorization"]?.split("Bearer ")[1]

  if (!token) {
    return res.json(new ResponseError("No token provided!", 401, false, null))
  }

  try {
    const authUser = jwt.verify(token, process.env.JWT_SECRET as string) as IUser
    req.user = authUser
    return next()
  } catch (error) {
    return res.json(new ResponseError("Unauthorized Token!", 403, false, null))
  }
}

const verifyRefreshToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const refresh_token = req.headers["authorization"]?.split("Bearer ")[1]

  if (!refresh_token) {
    return res.json(new ResponseError("No token provided!", 401, false, null))
  }

  try {
    const authUser = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET as string) as IUser
    req.user = authUser
    req.body.refresh_token = refresh_token
    return next()
  } catch (error) {
    return res.json(new ResponseError("Unauthorized Token!", 403, false, null))
  }
}

export { verifyToken, verifyRefreshToken }
