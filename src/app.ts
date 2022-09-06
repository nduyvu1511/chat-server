import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import path from "path"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUI from "swagger-ui-express"
import db from "./config"
import route from "./routes"

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.json({ limit: "10mb" }))

db.connect()

app.use(morgan("combined"))

const corsConfig = {
  origin: true,
  Credential: true,
}

app.use(cors(corsConfig))

route(app)

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat library API",
      version: "1.0.0",
      description: "This is chat app using express js mongodb",
    },
    servers: [
      {
        url: process.env.API_URL,
      },
    ],
  },
  apis: ["src/routes/userRoute.ts"], // files containing annotations as above
}
const specs = swaggerJsDoc(options)
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`)
})
