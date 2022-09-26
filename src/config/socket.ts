import { Server } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import { LikeMessageRes, MessageRes, UnlikeMessageRes, UserData } from "../types"
import log from "./logger"

const socketHandler = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  try {
    io.on("connection", (socket) => {
      // User login to our system
      socket.on("login", async (user: UserData) => {
        const socketIds = await UserService.getSocketIdsByUserIds(user.user_chatted_with_ids)
        socketIds.forEach((item) => {
          if (item.socket_id) {
            socket.to(item.socket_id).emit("login", user)
          }
        })
      })

      // When user is disconnecting then change status to offline
      socket.on("disconnecting", async () => {
        const data = await UserService.removeUserSocketId({
          socket_id: socket.id,
        })
        if (!data?.user_id) return

        const socketIds = await UserService.getSocketIdsByUserIds(data.user_chatted_with_ids)
        socketIds.forEach((item) => {
          if (item.socket_id) {
            socket.to(item.socket_id).emit("logout", data)
          }
        })
      })

      // Room handler
      socket.on(`join_room`, (roomId: string) => {
        socket.join(roomId)
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
        if (!payload?.author?.author_socket_id) return
        socket.to(payload.author.author_socket_id.toString()).emit("confirm_read_message", payload)
      })
      socket.on("like_message", async (payload: LikeMessageRes) => {
        console.log("liked message: ", payload)
        socket.to(payload.room_id.toString()).emit("like_message", payload)
      })
      socket.on("unlike_message", async (payload: UnlikeMessageRes) => {
        console.log("unliked message: ", payload)
        socket.to(payload.room_id.toString()).emit("unlike_message", payload)
      })

      // Typing handler
      socket.on("start_typing", (roomId: string) => {
        socket.to(roomId).emit("start_typing")
      })
      socket.on("stop_typing", (roomId: string) => {
        socket.to(roomId).emit("stop_typing")
      })
    })
  } catch (error) {
    log.error(error)
  }
}

export default socketHandler
