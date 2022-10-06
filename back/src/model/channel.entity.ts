import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum ChannelType {
	PUBLIC = "Public",
	PROTECTED = "Protected",
	PRIVATE = "Private"
}

@Entity()
export class Channel {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'varchar'
	})
	name: string;

	@ManyToMany(() => User, (user) => (user.username))
	users: User[];

}