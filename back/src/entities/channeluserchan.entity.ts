import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
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
  @ManyToOne(() => Channel, (chan) => (chan.users))
  channel: Channel;

  @PrimaryColumn('varchar')
  @ManyToOne(() => User, (user) => (user.channels))
  user: User;

  @Column({ default: ChannelUserStatus.JOINED })
  status: ChannelUserStatus;
}
