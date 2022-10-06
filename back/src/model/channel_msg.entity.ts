import { Column, CreateDateColumn, Double, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Channel } from './channel.entity';

@Entity()
export class ChannelMsg {

	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn({
		type: 'timestamptz'
	})
	date: Date;

	@Column({
		type: 'varchar'
	})
	content: string;

	@ManyToOne(() => User, user => user.username)
	sender: User;

	@ManyToOne(() => Channel, (chan) => (chan.id))
	channel: Channel;
}
