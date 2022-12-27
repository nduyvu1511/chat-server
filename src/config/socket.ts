import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { Server } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import MessageService from "../services/messageService"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import { FriendStatusRes, IUser, MessagePopulate, MessageRes, RoomTypingRes } from "../types"
import log from "./logger"
import pushNotificationService from "../services/pushNotificationService"
import { toMessageText } from "../utils/messageResponse"

const socketHandler = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  try {
    io.use(async (socket, next) => {
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

        // Get friends of logged in user
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
      socket.on("disconnect", async () => {
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
      socket.on("join_room", async (room_id: ObjectId) => {
        const { _id } = socket.data

        socket.join(room_id.toString())

        const room = await RoomService.getRoomById(room_id)
        if (!room) return

        const user = room.member_ids?.find((item) => item.user_id.toString() === _id.toString())
        // Clear message unread if has value
        if (user?.message_unread_ids?.length) {
          socket.emit("read_all_message", room_id)
          RoomService.clearMessageUnreadFromRoom({ room_id, user_id: user.user_id })
          MessageService.confirmReadAllMessageInRoom({ room_id, user_id: user.user_id })

          const lastMessage = await MessageService.getLastMessageInRoom({
            current_user: socket.data as any,
            room_id,
          })

          // only emit if author is currently in this room
          if (
            lastMessage?.author?.author_socket_id &&
            Array.from(
              io.sockets.adapter.sids.get(lastMessage?.author?.author_socket_id) || []
            )?.[1] === room_id.toString()
          ) {
            socket
              .to(lastMessage.author.author_socket_id.toString())
              .emit("partner_read_all_message", lastMessage)
          }
        }
      })

      socket.on("leave_room", (room_id: string) => {
        socket.leave(room_id)
      })

      // socket.on("create_room", async (room: RoomDetailRes) => {
      //   const users = await UserService.getSocketIdsByUserIds(
      //     room.members?.data?.map((item) => item.user_id.toString())
      //   )

      //   const user = await UserService.getUserById(socket.data._id)
      //   if (!user) return

      //   const partners = users.filter((item) => item.socket_id && item.socket_id !== socket.id)
      //   if (partners?.length) {
      //     partners.forEach((item) => {
      //       socket.to(item.socket_id).emit("create_room", room)
      //     })
      //   }
      // })

      // Message handler
      socket.on("send_message", async (payload: MessageRes) => {
        // To client is online and in current room
        socket.to(payload.room_id.toString()).emit("receive_message", {
          ...payload,
          is_author: false,
        })

        const socketIds = await RoomService.getSocketIdsFromRoom(payload.room_id.toString())
        const partnerSocketIds = socketIds.filter((item) => item.socket_id !== socket.id)
        if (!partnerSocketIds?.length) return

        partnerSocketIds.forEach(async (item) => {
          if (item.device_id) {

            const message = toMessageText(payload)

            const notification = {
              contents: {
                'en': message,
              },
              priority: 10,
              headings: {
                'en': "Bạn có tin nhắn mới",
              },
              large_icon: payload.author.author_avatar,
              include_player_ids: [item.device_id],
              data: payload,
            };

            pushNotificationService.createNotication(notification)
          }

          if (item.socket_id) {
            if (
              Array.from(io.sockets.adapter.sids.get(item.socket_id) || [])?.[1] !==
              Array.from(socket.rooms)?.[1]
            ) {
              const res = await RoomService.addMessageUnreadToRoom({
                message_id: payload.message_id,
                user_id: item.user_id,
                room_id: payload.room_id,
              })
              if (res?._id) {
                socket
                  .to(item.socket_id)
                  .emit("receive_unread_message", { ...payload, is_author: false })
              }

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
        if (payload?.author?.author_socket_id) {
          socket
            .to(payload.author.author_socket_id.toString())
            .emit("confirm_read_message", payload)
        }

        await MessageService.confirmReadMessage({
          message_id: payload.message_id,
          user_id: socket.data._id,
        })
      })

      // socket.on("like_message", async (payload: LikeMessageRes) => {
      //   socket.to(payload.room_id.toString()).emit("like_message", payload)
      // })

      // socket.on("unlike_message", async (payload: UnlikeMessageRes) => {
      //   socket.to(payload.room_id.toString()).emit("unlike_message", payload)
      // })

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
