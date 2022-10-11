import jwt from "jsonwebtoken"
import { Server } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import MessageService from "../services/messageService"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import {
  FriendStatusRes,
  IUser,
  LikeMessageRes,
  MessageRes,
  RoomTypingRes,
  UnlikeMessageRes,
} from "../types"
import log from "./logger"

const socketHandler = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  try {
    io.use((socket, next) => {
      const { access_token = "" } = socket.handshake.query
      if (!access_token) return new Error("No token provided")

      const authUser = jwt.verify(access_token as string, process.env.JWT_SECRET as string) as IUser

      if (!authUser) {
        return new Error("No token provided")
      }

      socket.data = authUser

      next()
    })

    io.on("connection", (socket) => {
      // User login to our system
      socket.on("login", async () => {
        const user = await UserService.addUserSocketId({
          socket_id: socket.id,
          user_id: socket.data._id,
        })
        if (!user) return

        const userRes = await UserService.getUserInfoByIUser(user)
        socket.emit("login", userRes)

        const res = await UserService.getSocketIdsByUserIds(user.user_chatted_with_ids as any)
        const partners = res?.filter(
          (item) => item.user_id.toString() !== user._id.toString() && item.socket_id
        )
        if (!partners?.length) return

        partners.forEach((item) => {
          const room_ids = item.room_joined_ids?.filter((rId) =>
            user.room_joined_ids?.some((_id) => _id.toString() === rId.toString())
          )

          socket.to(item.socket_id).emit("friend_login", {
            room_ids,
            user_id: user._id,
          } as FriendStatusRes)
        })
      })

      // When user is disconnecting then change status to offline
      socket.on("disconnecting", async () => {
        const user = await UserService.removeUserSocketId({
          socket_id: socket.id,
        })
        if (!user?.user_id) return

        const res = await UserService.getSocketIdsByUserIds(user.user_chatted_with_ids as any)
        const partners = res?.filter(
          (item) => item.user_id.toString() !== user._id.toString() && item.socket_id
        )
        if (!partners?.length) return

        partners.forEach((item) => {
          const room_ids = item.room_joined_ids?.filter((rId) =>
            user.room_joined_ids?.some((_id) => _id.toString() === rId.toString())
          )

          socket.to(item.socket_id).emit("friend_logout", {
            room_ids,
            user_id: user._id,
          } as FriendStatusRes)
        })
      })

      // Room handler
      socket.on(`join_room`, async (room_id: string) => {
        socket.join(room_id)
      })
      socket.on("leave_room", (room_id: string) => {
        socket.leave(room_id)
      })

      // Message handler
      socket.on("send_message", async (payload: MessageRes) => {
        // To client is online and in current room
        socket.to(payload.room_id.toString()).emit(`receive_message`, {
          ...payload,
          is_author: false,
        })

        const socketIds = await RoomService.getSocketIdsFromRoom(payload.room_id.toString())
        const partnerSocketIds = socketIds.filter((item) => item.socket_id !== socket.id)
        if (!partnerSocketIds?.length) return

        partnerSocketIds.forEach(async (item) => {
          if (item.socket_id) {
            if (
              Array.from(io.sockets.adapter.sids.get(item.socket_id) || [])?.[1] !==
              Array.from(socket.rooms)?.[1]
            ) {
              socket
                .to(item.socket_id)
                .emit("receive_unread_message", { ...payload, is_author: false })
            }
          } else {
            RoomService.addMessageUnreadToRoom({
              message_id: payload.message_id,
              user_id: item.user_id,
              room_id: payload.room_id,
            })
          }
        })
      })

      socket.on("read_message", async (payload: MessageRes) => {
        await MessageService.confirmReadMessage({
          message_id: payload.message_id,
          user_id: socket.data._id,
        })

        if (!payload?.author?.author_socket_id) return
        socket.to(payload.author.author_socket_id.toString()).emit("confirm_read_message", payload)
      })

      socket.on("like_message", async (payload: LikeMessageRes) => {
        socket.to(payload.room_id.toString()).emit("like_message", payload)
      })

      socket.on("unlike_message", async (payload: UnlikeMessageRes) => {
        socket.to(payload.room_id.toString()).emit("unlike_message", payload)
      })

      // Typing handler
      socket.on("start_typing", (payload: RoomTypingRes) => {
        socket.to(payload.room_id.toString()).emit("start_typing", payload)
      })

      socket.on("stop_typing", (payload: RoomTypingRes) => {
        socket.to(payload.room_id).emit("stop_typing", payload)
      })
    })
  } catch (error) {
    log.error(error)
  }
}

export default socketHandler
