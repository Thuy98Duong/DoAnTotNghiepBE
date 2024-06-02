import { Socket } from 'socket.io';

export type TUserSocket = Socket & { userId?: string; user?: ReqUser };

export type TMessagePayload = { userId: string; message: string };
