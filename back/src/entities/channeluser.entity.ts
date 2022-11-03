import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

enum ChannelUserStatus {
  OWNER = "Owner",
  JOINED = "Joined",
  MUTED = "Muted",
  BANNED = "Banned"
}

@Entity('channel_user')
export class ChannelUser {

  @PrimaryColumn({ type: 'int', name: 'channel' })
  channelId: Channel;

  @PrimaryColumn({ type: 'varchar', name: 'user' })
  userFtLogin: User;

  @ManyToOne(() => Channel, (chan) => (chan.users))
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  @ManyToOne(() => User, (user) => (user.channels))
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({ default: ChannelUserStatus.OWNER })
  status: ChannelUserStatus;
}

export namespace ChannelUser {
  export import Status = ChannelUserStatus;
}

