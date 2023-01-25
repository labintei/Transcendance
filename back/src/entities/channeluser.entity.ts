import { BaseEntity, Column, Entity, FindOptionsSelect, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

enum ChannelUserRights {
  OWNER = "Owner",
  ADMIN = "Admin",
  MUTED = "Muted",
  BANNED = "Banned"
}

enum ChannelUserStatus {
  INVITED = "Invited",
  JOINED = "Joined"
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
    enum: ChannelUserRights,
    default: null
  })
  rights: ChannelUserRights;

  @Column({
    type: 'enum',
    nullable: true,
    enum: ChannelUserStatus,
    default: null
  })
  status: ChannelUserStatus;

  @Column({ nullable: true, default: null })
  rightsEnd: Date;

  @ManyToOne(() => Channel, (chan) => (chan.users), { onDelete: "CASCADE" })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  @ManyToOne(() => User, (user) => (user.channels), { onDelete: "CASCADE" })
  @JoinColumn({ name: 'user' })
  user: User;

  isOwner(): boolean {
    return this.rights === ChannelUser.Rights.OWNER;
  }

  isAdmin(): boolean {
    return this.isOwner()
      || this.rights === ChannelUser.Rights.ADMIN;
  }

  canSpeak(): boolean {
    return this.status === ChannelUser.Status.JOINED;
  }

}

export namespace ChannelUser {
  export import Status = ChannelUserStatus;
  export import Rights = ChannelUserRights;
}
