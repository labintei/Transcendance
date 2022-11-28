import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';
import { isArray } from 'util';

const chanRoomPrefix = "channel_";

@Injectable()
export class SocketService {

	public io: Server = null;
	
	async userEmit(user: User, event: string, content: any): Promise<boolean> {
		return this.io.in(user.socket).emit(event, content);
	}

	async channelEmit(channel: Channel, event: string, content: any): Promise<boolean> {
		return this.io.in(chanRoomPrefix + channel.id).emit(event, content);
	}

	async userJoinRoom(user: User, rooms: string|string[]): Promise<void> {
		return this.io.in(user.socket).socketsJoin(rooms);
	}

	async userLeaveRoom(user: User, rooms: string|string[]): Promise<void> {
		return this.io.in(user.socket).socketsLeave(rooms);
	}

	async userDisconnect(user: User): Promise<void> {
		return this.io.in(user.socket).disconnectSockets();
	}

	static channelsToRooms(channels: Channel[]): string[] {
		return channels.map<string>((chan) => { return chanRoomPrefix + chan.id; });
	}

}