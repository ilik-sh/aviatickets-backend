import { MessageDto } from "./message.dto"

export class RoomDto { 
    messages: MessageDto[]
    users: string[]
}