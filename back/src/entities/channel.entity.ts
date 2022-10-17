import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChannelUser } from './channeluser.entity';
import { Message } from './message.entity';

export enum ChannelStatus {
  DIRECT = "Direct",
  PUBLIC = "Public",
  PRIVATE = "Private"
}

@Entity()
export class Channel {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: ChannelStatus.DIRECT })
  status: ChannelStatus;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.channel))
  users: ChannelUser[];

  @OneToMany(() => Message, (msg) => (msg.channel))
  messages: Message[];
}
