import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { WsException } from '@nestjs/websockets';

export function jwtMiddleware(socket: Socket, next: any) {
  const token = socket.handshake.auth.token;
  if (!token) {
    const { id, role, name } = socket.handshake.headers;
    socket.user = { id, roleType: role, name };
    return next();
  }
  try {
    const payload = verify(token, 'DaLKeg^W:%AZ1*%l');
    socket.user = payload;
  } catch (error) {
    console.log('sss');
  }
  next();
}
