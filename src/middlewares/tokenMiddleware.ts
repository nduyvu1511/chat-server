import jwt from "jsonwebtoken"
import * as express from "express"
import ResponseData from "../utils/apiRes"

const verifyToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers["authorization"]?.split("Bearer ")[1]

  if (!token) {
    return res.json(new ResponseData("No token provided!", 403, false, null))
  }

  try {
    const authUser = jwt.verify(token, process.env.JWT_SECRET as string)
    req.locals = authUser
    return next()
  } catch (error) {
    return res.json(new ResponseData("Unauthorized Token!", 401, false, null))
  }
}

export { verifyToken }
