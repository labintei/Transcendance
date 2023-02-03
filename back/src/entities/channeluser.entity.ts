import { AppService } from "src/app.service";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

const rightsTimeoutMargin = 30000;  // 30 seconds minimum.

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

  @Index()
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

  @Index()
  @UpdateDateColumn()
  updated: Date;

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
    return (this.rights !== ChannelUser.Rights.MUTED
      && this.rights !== ChannelUser.Rights.BANNED
      && this.status === ChannelUser.Status.JOINED);
  }

  private rightsTimeoutName(): string {
    return 'rightsTimeout-' + this.channelId + '-' + this.userLogin;
  }

  private async revokeRights() {
    const channelId = this.channelId;
    const userLogin = this.userLogin;
    this.rights = null;
    this.rightsEnd = null;
    console.log ("Revoked rights of " + this.userLogin + " on channel " + this.channelId + ".");
    if (this.status)
      await this.save();
    else
      await this.remove();
    User.listsUpdate(userLogin);
    Channel.contentUpdate(channelId);
  }

  async updateRightsTimeout() {
    if (!this.channelId || !this.userLogin)
      return;
    AppService.deleteTimeout(this.rightsTimeoutName());
    if (!this.rights || !this.rightsEnd)
      return;
    const delay = this.rightsEnd.getTime() - Date.now();
    if (delay >= rightsTimeoutMargin) {
      AppService.setTimeout(
        this.rightsTimeoutName(),
        async () => { await this.revokeRights() },
        delay);
      const interval = new Date(delay);
      const intervalString = (interval.getUTCHours() ? interval.getUTCHours().toString() + "hrs " : "")
        + (interval.getUTCHours() || interval.getUTCMinutes() ? interval.getUTCMinutes().toLocaleString('fr-FR', {minimumIntegerDigits: 2, useGrouping:false}) + "min " : "")
        + interval.getUTCSeconds().toLocaleString('fr-FR', {minimumIntegerDigits: 2, useGrouping:false}) + "sec";
      console.log ("Rights of " + this.userLogin + " on channel " + this.channelId + " will be revoked in " + intervalString + ".");
    }
    else
      await this.revokeRights();
  }

  static async setRightsTimeoutsOnStartup() {
    const now = new Date();
    const allChanUsers = await ChannelUser.findBy({});
    for (let chanUser of allChanUsers) {
      await chanUser.updateRightsTimeout();
    }
  }

}

export namespace ChannelUser {
  export import Status = ChannelUserStatus;
  export import Rights = ChannelUserRights;
}
