import { Injectable } from '@nestjs/common';
import { TMessagePayload, TUserSocket } from './types';
import { Server } from 'socket.io';

@Injectable()
export class ChatService {
  sendMessage(socket: TUserSocket, payload: TMessagePayload, server: Server) {
    server.sockets.sockets.forEach((toSocket: TUserSocket) => {
      if (toSocket.userId === payload.userId) {
        toSocket.emit('message', {
          ...payload,
          fromUserId: socket.userId,
        });
      }
    });
  }
}
