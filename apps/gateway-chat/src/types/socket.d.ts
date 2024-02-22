import { Socket } from "socket.io/dist/socket"

declare module 'socket.io/dist' {
    interface Socket {
        user: UserInfoDto
    }
}