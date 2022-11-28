import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {

	public io: Server = null;
	public static pingTimeout = 10000;
	
}