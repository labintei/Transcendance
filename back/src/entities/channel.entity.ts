import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne, Unique } from 'typeorm';
import { ChannelUser } from './channeluserchan.entity';
import { Message } from './message.entity';
import { User } from './user.entity';

export enum ChannelStatus {
  PUBLIC = "Public",
  PRIVATE = "Private"
}

@Entity()
export class Channel {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: ChannelStatus.PUBLIC })
  status: ChannelStatus;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.channel))
  users: User[];

  @OneToMany(() => Message, (msg) => (msg.channel))
  messages: Message[];
}
