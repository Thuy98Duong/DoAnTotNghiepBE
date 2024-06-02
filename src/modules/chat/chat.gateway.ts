import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TMessagePayload, TUserSocket } from './types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e7, // 10 MB
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: TUserSocket) {
    const token: string = socket.handshake.headers.authorization;
    const payload = this.jwtService.verify(token);
    socket.userId = payload.id;
    socket.user = payload;
  }

  handleDisconnect(socket: Socket) {
    console.log('User disconnected: ', socket.id);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: TUserSocket,
    @MessageBody() payload: TMessagePayload,
  ) {
    this.server.sockets.sockets.forEach((toSocket: TUserSocket) => {
      if (toSocket.userId === payload.userId) {
        toSocket.emit('message', {
          ...payload,
          userId: socket.userId,
        });
      }
    });
  }
}
