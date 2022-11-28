import { AfterRemove, BaseEntity, BeforeRemove, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

enum ChannelUserStatus {
  OWNER = "Owner",
  ADMIN = "Admin",
  INVITED = "Invited",
  MUTED = "Muted",
  BANNED = "Banned",
	DIRECT_ALTER = "Direct Message Alter"
}

@Entity('channel_user')
export class ChannelUser extends BaseEntity {

  @PrimaryColumn({ type: 'int', name: 'channel' })
  channelId: number;

  @PrimaryColumn({ type: 'varchar', name: 'user' })
  userLogin: string;

  @Column({
    type: 'enum',
		nullable: true,
    enum: ChannelUserStatus,
    default: null
  })
  status: ChannelUserStatus;

  @Column({ default: null })
  joined: boolean;

  @Column({ nullable: true })
  statusEnd: Date;

  @ManyToOne(() => Channel, (chan) => (chan.users), { onDelete: "CASCADE" })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  @ManyToOne(() => User, (user) => (user.channels), { onDelete: "CASCADE" })
  @JoinColumn({ name: 'user' })
  user: User;

	isOwner(): boolean {
		return this.status === ChannelUser.Status.OWNER;
  }

  isAdmin(): boolean {
		return this.isOwner()
			|| this.status === ChannelUser.Status.ADMIN;
  }

  canSpeak(): boolean {
		return this.joined
		&& this.status !== ChannelUser.Status.MUTED;
  }

}

export namespace ChannelUser {
  export import Status = ChannelUserStatus;
}

