import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from 'chat/socket/socket.service';
import { Server, Socket } from 'socket.io';
import { MessageDto } from 'chat/dtos/message.dto';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private server: Server;

  constructor(private readonly socketService: SocketService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: MessageDto,
  ) {
    const message = payload;
    if (socket.user.roleType != 'Sales') {
      message.sender = socket.user.id;
      message.senderName = socket.user.name;
    }
    const roomId = `${[message.sender, message.reciever].sort().join()}`;
    this.sendMessage(roomId, 'newMessage', message);
  }

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload,
  ) {
    const roomId = `${['Sales', payload.client].sort().join()}`;
    const room = await this.socketService.getRoom(roomId);
    socket.join(roomId);
    const messages = room.messages;
    this.server.to(socket.id).emit('messageHistory', messages);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (socket.user.roleType == 'User') {
      await this.handleClientDisconnection(socket);
    }
    if (socket.user.roleType == 'Sales') {
      await this.handleSalesDisconnection(socket);
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    if (socket.user.roleType == 'User') {
      await this.handleClientConnection(socket);
    }
    if (socket.user.roleType == 'Sales') {
      await this.handleSalesConnection(socket);
    }
  }

  async afterInit(server: any) {
    const queue = await this.socketService.getRoom('supportQueue');
    if (!queue) {
      this.socketService.createRoomWithoutExpiry('supportQueue', [], []);
    }
    const desk = await this.socketService.getRoom('supportDesk');
    if (!desk) {
      this.socketService.createRoomWithoutExpiry('supportDesk', [], []);
    }
  }

  private handleSalesDisconnection(socket: Socket) {
    this.leaveRoom(socket, 'supportDesk', 0);
  }

  private async handleClientDisconnection(socket: Socket) {
    this.leaveRoom(socket, 'supportQueue', 0);
    this.server.to('supportDesk').emit('clientLeft', { id: socket.user.id });
  }

  private async handleSalesConnection(socket: Socket) {
    const user = socket.user;
    await this.joinRoom(socket, 'supportDesk', 0);
    const queue = await this.socketService.getRoom('supportQueue');
    queue.users.map(async (id) => {
      const userInfo = await this.socketService.getUser({ id });
      this.server
        .to(socket.id)
        .emit('newClient', { id: id, name: userInfo.name });
    });
  }

  private async handleClientConnection(socket: Socket) {
    const user = socket.user;
    const existingUser = await this.socketService.getUser(user);
    if (!existingUser) {
      await this.socketService.setUser(user, socket.id);
      const roomId = `${['Sales', user.id].sort().join()}`;
      await this.socketService.createRoom(roomId, [], [user.id]);
      socket.join(roomId);
      await this.joinRoom(socket, 'supportQueue', 0);
      await this.sendMessage(
        'supportDesk',
        'newClient',
        { id: user.id, name: user.name },
        0,
      );
      return;
    }
    await this.joinRoom(socket, 'supportQueue', 0);
    await this.sendMessage(
      'supportDesk',
      'newClient',
      { id: user.id, name: user.name },
      0,
    );

    const roomId = `${['Sales', user.id].sort().join()}`;
    socket.join(roomId);
    const room = await this.socketService.getRoom(roomId);
    const messages = room.messages;
    this.server.to(socket.id).emit('messageHistory', messages);
    await this.socketService.setUserSocket(user, socket.id);
  }

  private async joinRoom(socket: Socket, roomId: string, ttl?: number) {
    await this.socketService.saveRoomEntry(socket.user, roomId, ttl);
    socket.join(roomId);
  }

  private async leaveRoom(socket: Socket, roomId: string, ttl?: number) {
    await this.socketService.leaveRoom(socket.user, roomId, ttl);
    socket.leave(roomId);
  }

  private async sendMessage(
    roomId: string,
    messageType: string,
    message: any,
    ttl?: number,
  ) {
    await this.socketService.saveMessage(roomId, message, ttl);
    this.server.to(roomId).emit(messageType, message);
  }
}
