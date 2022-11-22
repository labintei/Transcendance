import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere } from 'typeorm';
import { ChannelUser } from './channeluser.entity';
import { Message } from './message.entity';
import { User } from './user.entity';
import bcrypt from 'bcrypt';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

enum ChannelStatus {
  DIRECT = "Direct",
  PUBLIC = "Public",
  PRIVATE = "Private"
}

@Entity('channel')
export class Channel extends BaseEntity {

  private static bcryptSaltRounds = 10;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.DIRECT
  })
  status: ChannelStatus;

  @Column({ type: 'varchar', length: 60, nullable: true })
  bcrypthash: string; // For password-protected channels

  @Column({ nullable: true, unique: true })
  name: string;

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.channel), { cascade: ["insert"] })
  users: ChannelUser[];

  @OneToMany(() => Message, (msg) => (msg.channel))
  messages: Message[];

  async isOwner(user: User): Promise<boolean> {
    const channel: Channel = this;
    return !!(await ChannelUser.findOneBy({
      channel: channel,
      user: user,
      status: ChannelUser.Status.OWNER
    } as FindOptionsWhere<ChannelUser>));
  }

  async isAdmin(user: User): Promise<boolean> {
    const channel = this as Channel;
    return !!(await ChannelUser.findOneBy({
      channel: channel,
      user: user,
      status: ChannelUser.Status.OWNER
        || ChannelUser.Status.ADMIN
    } as FindOptionsWhere<ChannelUser>));
  }

  async canSpeak(user: User): Promise<boolean> {
    const channel = this as Channel;
    return !!(await ChannelUser.findOneBy({
      channel: channel,
      user: user,
      status: ChannelUser.Status.OWNER
        || ChannelUser.Status.ADMIN
        || ChannelUser.Status.JOINED
    } as FindOptionsWhere<ChannelUser>));
  }

  async isMuted(user: User): Promise<boolean> {
    const channel = this as Channel;
    return !!(await ChannelUser.findOneBy({
      channel: channel,
      user: user,
      status: ChannelUser.Status.OWNER
        || ChannelUser.Status.ADMIN
        || ChannelUser.Status.JOINED
        || ChannelUser.Status.MUTED
    } as FindOptionsWhere<ChannelUser>));
  }

  async isMember(user: User): Promise<boolean> {
    const channel = this as Channel;
    return !!(await ChannelUser.findOneBy({
      channel: channel,
      user: user,
      status: ChannelUser.Status.OWNER
        || ChannelUser.Status.ADMIN
        || ChannelUser.Status.JOINED
        || ChannelUser.Status.MUTED
    } as FindOptionsWhere<ChannelUser>));
  }

  async join(user: User, password?: string): Promise<ChannelUser> {
    const channel = this as Channel;
    if (this.bcrypthash && await !bcrypt.compare(password, this.bcrypthash))
      throw new ForbiddenException("Channel Password does not match.");
    const chanUser = await ChannelUser.findOneBy({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
    if (chanUser && chanUser.status === ChannelUser.Status.BANNED)
      throw new ForbiddenException("You are banned from this channel.");
    return ChannelUser.save({
      channel: channel,
      user: user,
      status: ChannelUser.Status.JOINED
    });
  }

  async leave(user: User) {
    const channel = this as Channel;
    ChannelUser.delete({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
  }

  static async getChannelById(chanId: number): Promise<Channel> {
    return Channel.findOneBy({id: chanId});
  }

  static async getChannelByName(chanName: string): Promise<Channel> {
    if (!chanName)
      return null;
    return Channel.findOneBy({name: chanName});
  }

  static async createPublicChannel(owner: User, name: string, password?: string): Promise<Channel> {
    if (!name)
      throw new BadRequestException("Channel name is required.")
    if (!!Channel.findOneBy({ name: name }))
      throw new ConflictException("Channel name already in use.")
    return await Channel.save({
      status: Channel.Status.PUBLIC,
      bcrypthash: password ? await bcrypt.hash(password, this.bcryptSaltRounds) : undefined,
      name: name,
      users: [{
        user: owner,
        status: ChannelUser.Status.OWNER
      }]
    });
  }

  static async createPrivateChannel(owner: User, name?: string): Promise<Channel> {
    if (name && !!Channel.findOneBy({ name: name }))
      name = undefined;
    return await Channel.save({
      status: Channel.Status.PRIVATE,
      name: name,
      users: [{
        user: owner,
        status: ChannelUser.Status.OWNER
      }]
    });
  }

  static async createOrGetDirectChannel(user1: User, user2: User) {
    // Check if channel exists.
    // else
    return await Channel.save({
      status: Channel.Status.DIRECT,
      users: [
        {
          user: user1,
          status: ChannelUser.Status.DIRECT
        },
        {
          user: user2,
          status: ChannelUser.Status.DIRECT
        }
      ]
    });
  }

  static async destroyCHannel(channel: Channel) {
    ChannelUser.delete(channel.users as FindOptionsWhere<ChannelUser>);
    Message.delete({channel: channel} as FindOptionsWhere<Message>);
    Channel.delete(channel as FindOptionsWhere<Channel>);
  }

  static async getMsgs(howMany: number, offset?: number): Promise<Message[]> {

    return
  }

  static async saveMsg(chanUsr: ChannelUser, msg: string) {
    throw new ForbiddenException("");
  }

}

export namespace Channel {
  export import Status = ChannelStatus;
}
