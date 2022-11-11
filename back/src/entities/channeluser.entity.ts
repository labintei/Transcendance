import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

enum ChannelUserStatus {
  DIRECT = "Direct",
  OWNER = "Owner",
  ADMIN = "Admin",
  JOINED = "Joined",
  INVITED = "Invited",
  MUTED = "Muted",
  BANNED = "Banned"
}

@Entity('channel_user')
export class ChannelUser extends BaseEntity {

  @PrimaryColumn({ type: 'int', name: 'channel' })
  channelId: Channel;

  @PrimaryColumn({ type: 'varchar', name: 'user' })
  userLogin: User;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  duration: number;

  @ManyToOne(() => Channel, (chan) => (chan.users), { cascade: ["insert", "remove"] })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  @ManyToOne(() => User, (user) => (user.channels))
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({
    type: 'enum',
    enum: ChannelUserStatus,
    default: ChannelUserStatus.DIRECT
  })
  status: ChannelUserStatus;

}

export namespace ChannelUser {
  export import Status = ChannelUserStatus;
}

