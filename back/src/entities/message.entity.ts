import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn, BaseEntity, Index, FindOptionsSelect } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from './user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

const messageDefaultFilter: FindOptionsSelect<Message> = {
  id: true,
  time: true,
  content: true,
	sender: User.defaultFilter,
	channel: Channel.defaultFilter
};

@Entity('message')
export class Message extends BaseEntity {

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

	async send(): Promise<Message> {
		this.id = undefined;
		this.time = undefined;
		await this.save();
		SocketGateway.channelEmit(this.channel, 'msg', this);
		return this;
	}
}

export namespace Message {
  export const defaultFilter = messageDefaultFilter;
}
