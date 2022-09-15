import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { createServer } from "http"
// import morgan from "morgan"
import path from "path"
import { Server } from "socket.io"
// import swaggerJsDoc from "swagger-jsdoc"
// import swaggerUI from "swagger-ui-express"
import db from "./config/db"
import socketHandler from "./config/socket"
import route from "./routes"

import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.json({ limit: "10mb" }))
// app.use(morgan("combined"))
const corsConfig = {
  origin: true,
  Credential: true,
}
app.use(cors(corsConfig))
route(app)
db.connect()
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`)
})

const httpServer = createServer(app)
httpServer.listen(process.env.CHAT_SOCKET_PORT, () => {
  console.log("chat server is running")
})
export const socket = new Server(httpServer, {
  cors: corsConfig,
})
socketHandler(socket)

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Chat library API",
//       version: "1.0.0",
//       description: "This is chat app using express js mongodb",
//     },
//     servers: [
//       {
//         url: process.env.API_URL,
//       },
//     ],
//   },
//   apis: ["src/routes/userRoute.ts"], // files containing annotations as above
// }
// const specs = swaggerJsDoc(options)
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))
