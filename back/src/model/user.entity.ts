import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class User {

	@PrimaryColumn({
		type: 'varchar',
		length: 24,
		unique: true
	})
	username: string;

	@Column({
		type: 'varchar',
		length: 8,
		unique: true
	})
	ft_login: string;

	@Column({
		type: 'varchar',
		length: 32
	})
	twoFA: string;

	@Column({type: 'float' })
	rank: number;

	@Column({	type: 'int' })
	victories: number;

	@Column({	type: 'int' })
	defeats: number;

	@Column({ type: 'int' })
	draws: number;

	@OneToMany(() => User, (friend) => (friend.username))
	friends: Promise<User[]>

	@OneToMany(() => User, (blocked) => (blocked.username))
	blockeds: Promise<User[]>
}

@Entity()
export class chat_msg {

	@PrimaryGeneratedColumn()
	id: number;

	@Column("varchar", {
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

@Entity()
export class direct_msg {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => chat, (chat) => (chat.id))
	chat_id: chat;

	@ManyToOne(() => user, (user) => (user.id))
	user_id: number;

	@Column("char")
	status: number;
}

@Entity()
export class message {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => user, (user) => (user.id))
	user_id: user;

	@ManyToOne(() => user, (user) => (user.id))
	sender_id: user;

	@Column()
	msg: string;
}

@Entity()
export class c_message {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => user, (user) => (user.id))
	sender_id: user;

	@ManyToOne(() => chat, (chat) => (chat.id))
	chat_id: user;

	@Column()
	msg: string;
}
