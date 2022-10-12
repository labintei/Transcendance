import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

export enum ChannelUserStatus {
  OWNER = "Owner",
  JOINED = "Joined",
  MUTED = "Muted",
  BANNED = "Banned"
}

@Entity()
export class ChannelUser {

  @PrimaryColumn('int')
  channel: Channel;

  @PrimaryColumn('varchar')
  user: User;

  @ManyToOne(() => Channel, (chan) => (chan.users))
  @JoinColumn({ name: 'channel' })
  _channel: Channel;

  @ManyToOne(() => User, (user) => (user.channels))
  @JoinColumn({ name: 'user' })
  _user: User;

  @Column({ default: ChannelUserStatus.JOINED })
  status: ChannelUserStatus;
}
