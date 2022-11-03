import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChannelUser } from './channeluser.entity';
import { Message } from './message.entity';

enum ChannelStatus {
  DIRECT = "Direct",
  PUBLIC = "Public",
  PRIVATE = "Private"
}

@Entity('channel')
export class Channel {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: ChannelStatus.DIRECT })
  status: ChannelStatus;

  @Column({ type: 'varchar', length: 60, nullable: true })
  bcrypthash: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.channel))
  users: ChannelUser[];

  @OneToMany(() => Message, (msg) => (msg.channel))
  messages: Message[];
}

export namespace Channel {
  export import Status = ChannelStatus;
}
