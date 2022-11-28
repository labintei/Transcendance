import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { SocketService } from 'src/socket/socket.service';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn, BaseEntity, Index, FindOptionsWhere } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelUser } from './channeluser.entity';
import { User } from './user.entity';

@Entity('message')
export class Message extends BaseEntity {

	// constructor(
	// 	private ioServ: SocketService
	// ) {
	// 	super();
	// }

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @CreateDateColumn()
  time: Date;

  @Column()
  content: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: 'sender' })
  sender: User;

  @ManyToOne(() => Channel, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

	async send(channel: Channel): Promise<Message> {
		this.channel = await Channel.findOneBy(channel as FindOptionsWhere<Channel>);
		if (!this.channel) {
			throw new NotFoundException("Message channel was not found !");
		}
		const chanUser = await ChannelUser.findOneBy({ channel: this.channel, user: this.sender } as FindOptionsWhere<ChannelUser>);
		if (!chanUser || !chanUser.canSpeak())
			throw new ForbiddenException("You cannot speak in this channel !");
		this.id = undefined;
		this.time = undefined;
		// if (!await this.ioServ.channelEmit(this.channel, 'msg', this))
		// 	throw new WsException("Could not send Message to channel room.")
		return this.save();
	}
}
