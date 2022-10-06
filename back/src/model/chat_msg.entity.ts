import { Column, CreateDateColumn, Double, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class chat_msg {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'varchar',
		length: 30,
		nullable: false,
		unique: true
	})
	name: string;

	@Column({ type: "varchar" })
	number;

	@ManyToOne(
		() => user,
		user => user.id
	)
	owner_id: user;

	@OneToMany(() => chat_connect, (chat_connect) => (chat_connect.chat_id))
	connections_chat: chat_connect[];

}

