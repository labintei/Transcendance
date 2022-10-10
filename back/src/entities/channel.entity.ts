import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';
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

  @Column('varchar')
  name: string;

  @OneToMany(() => Message, (msg) => (msg.id))
  messages: Message[];

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];
}
