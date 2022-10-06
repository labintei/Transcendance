import { Entity, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ChatRoom {

	@PrimaryColumn({
		type: 'varchar',
		nullable: false,
		unique: true
	})
	name: string;


}