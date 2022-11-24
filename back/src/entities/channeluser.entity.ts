import { AfterRemove, BaseEntity, BeforeRemove, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

enum ChannelUserStatus {
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
  channelId: number;

  @PrimaryColumn({ type: 'varchar', name: 'user' })
  userLogin: string;

  @Column({
    type: 'enum',
    enum: ChannelUserStatus,
    default: ChannelUserStatus.INVITED
  })
  status: ChannelUserStatus;

  @Column({ nullable: true })
  statusEnd: Date;

  @ManyToOne(() => Channel, (chan) => (chan.users), { onDelete: "CASCADE" })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  @ManyToOne(() => User, (user) => (user.channels), { onDelete: "CASCADE" })
  @JoinColumn({ name: 'user' })
  user: User;

}

export namespace ChannelUser {
  export import Status = ChannelUserStatus;
}

