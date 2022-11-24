import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere, Not, CannotAttachTreeChildrenEntityError, In, BeforeRemove } from 'typeorm';
import { ChannelUser } from './channeluser.entity';
import { Message } from './message.entity';
import { User } from './user.entity';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import bcrypt from 'bcrypt';

const channelPublicFilter = {
  id: true,
  status: true,
  bcrypthash: false,
  name: true,
};

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
    default: ChannelStatus.PUBLIC
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

  async join(user: User, password?: string): Promise<ChannelUser> {
    const channel = this as Channel;
    if (this.status != Channel.Status.PUBLIC)
      throw new ForbiddenException("Channel is not public, you must be invited.");
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
      user: user,
      status: Not(ChannelUser.Status.BANNED)
    } as FindOptionsWhere<ChannelUser>);
  }

  async ban(user: User) {
    const channel = this as Channel;
    ChannelUser.delete({
      channel: channel,
      user: user,
      status: Not(ChannelUser.Status.BANNED)
    } as FindOptionsWhere<ChannelUser>);
  }

  async unban(user: User) {
    const channel = this as Channel;
    ChannelUser.delete({
      channel: channel,
      user: user,
      status: Not(ChannelUser.Status.BANNED)
    } as FindOptionsWhere<ChannelUser>);
  }

  static async createPublicChannel(owner: User, name: string, password?: string): Promise<Channel> {
    if (!name)
      throw new BadRequestException("Channel name is required.")
    if (!!Channel.findOneBy({ name: name }))
      throw new ConflictException("Channel name already in use.")
    return await Channel.create({
      status: Channel.Status.PUBLIC,
      bcrypthash: password ? await bcrypt.hash(password, this.bcryptSaltRounds) : undefined,
      name: name,
      users: [
        {
          user: owner,
          status: ChannelUser.Status.OWNER
        }
      ]
    }).save();
  }

  static async createPrivateChannel(owner: User, name: string): Promise<Channel> {
    if (name && !!Channel.findOneBy({ name: name }))
      name = undefined;
    return await Channel.create({
      status: Channel.Status.PRIVATE,
      name: name,
      users: [
        {
        user: owner,
        status: ChannelUser.Status.OWNER
        }
      ]
    }).save();
  }

  static async getDirectChannel(owner: User, other: User, isSenderSide: boolean): Promise<Channel> {
    if ((await User.countBy([owner, other] as FindOptionsWhere<User>)) < 2)
      throw new BadRequestException("wrong user parameters.")
    const channel = await Channel.createQueryBuilder()
      .innerJoin("channel.users","owner")
      .innerJoin("channel.users","other")
      .where("channel.status = :status", { status: Channel.Status.DIRECT })
      .andWhere("owner.id = :ownerLogin", { ownerLogin: owner.ft_login })
      .andWhere("other.id = :otherLogin", { otherLogin: other.ft_login })
      .andWhere("other.status = :otherStatus", { otherStatus: ChannelUser.Status.JOINED })
      .getOne();
    if (channel)
      return channel;
    return await Channel.create({
      status: Channel.Status.PRIVATE,
      users: [
        {
          user: owner,
          status: ChannelUser.Status.OWNER
        },
        {
          user: owner,
          status: ChannelUser.Status.OWNER
        }
      ]
    }).save();
  }

  static async getPublicList(): Promise<Channel[]> {
    return Channel.find({
      select: Channel.publicFilter,
      where: {
        status: Channel.Status.PUBLIC
      } as FindOptionsWhere<Channel>
    });
  }

  static async getUserList(user: User): Promise<ChannelUser[]> {
    return ChannelUser.find({
      relations: {
        channel: true
      },
      select: {
        channel: Channel.publicFilter
      },
      where: {
        user: user,
        status: Not( In( [ ChannelUser.Status.BANNED ] ) )
      } as FindOptionsWhere<ChannelUser>
    });
  }

  static async getMsgs(howMany: number, offset?: number): Promise<Message[]> {

    return
  }

}

export namespace Channel {
  export import Status = ChannelStatus;
  export const publicFilter = channelPublicFilter;
}
