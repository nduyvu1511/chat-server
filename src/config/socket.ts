import { Server } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import { MessageRes, UserData } from "../types"

const socketHandler = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  io.on("connection", (socket) => {
    // User login to our system
    socket.on("login", async (params: UserData) => {
      const user = await UserService.addUserSocketId({
        user_id: params.user_id.toString(),
        socket_id: socket.id,
      })
      const socketIds = await UserService.getSocketIdsByUserIds(params.user_chatted_with_ids)
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
      socket.to(payload.room_id.toString()).emit(`receive_message`, {
        ...payload,
        is_author: false,
      })

      const socketIds = await RoomService.getSocketIdsFromRoom(payload.room_id.toString())
      const partnerSocketIds = socketIds.filter((item) => item.socket_id !== socket.id)
      if (partnerSocketIds?.length === 0) return

      partnerSocketIds.forEach(async (item) => {
        if (item.socket_id) {
          socket.to(item.socket_id).emit("receive_unread_message", payload)
        } else {
          // Send message unread for clients offline
          RoomService.addMessageUnreadToRoom({
            message_id: payload.message_id,
            user_id: item.user_id,
            room_id: payload.room_id,
          })
        }
      })
    })

    // Typing handler
    socket.on("start_typing", (roomId: string) => {
      socket.to(roomId).emit("start_typing")
    })
    socket.on("stop_typing", (roomId: string) => {
      socket.to(roomId).emit("stop_typing")
    })
  })
}

export default socketHandler
