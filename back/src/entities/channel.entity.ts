import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere, Not, CannotAttachTreeChildrenEntityError, In, BeforeRemove } from 'typeorm';
import { ChannelUser } from './channeluser.entity';
import { Message } from './message.entity';
import { User } from './user.entity';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

	async setPassword(user: User, password?: string): Promise<Channel> {
    const channel = this as Channel;
		const chanUser = await ChannelUser.findOneBy({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
		if (!chanUser.isOwner())
			throw new UnauthorizedException("Only the owner of the channel can set the password.");
		this.bcrypthash = password ? await bcrypt.hash(password, Channel.bcryptSaltRounds) : null;
		return this.save();
	}

  async join(user: User, password?: string): Promise<ChannelUser> {
    const channel = this as Channel;
		const chanUser = await ChannelUser.findOneBy({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
		if (chanUser) {
			if (chanUser.joined)
				return chanUser;
			if (chanUser.status === ChannelUser.Status.BANNED)
				throw new ForbiddenException("You are banned from this channel.");
			if (chanUser.status === ChannelUser.Status.INVITED) {
				chanUser.status = null;
			}
			chanUser.joined = true;
			return chanUser.save();
		}
    if (this.status !== Channel.Status.PUBLIC)
      throw new ForbiddenException("Channel is not public, you must be invited.");
    if (this.bcrypthash) {
			if (!password)
				throw new ForbiddenException("Protected Channel, password is required.");
			if (await !bcrypt.compare(password, this.bcrypthash))
				throw new ForbiddenException("Channel password does not match.");
		}
    return ChannelUser.save({
      channel: channel,
      user: user,
      status: null,
			joined: true
    });
  }

  async leave(user: User): Promise<ChannelUser> {
    const channel = this as Channel;
		const chanUser = await ChannelUser.findOneBy({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
		if (!chanUser || !chanUser.joined)
			throw new NotFoundException("User is not a member of this channel.");
		chanUser.joined = false;
		if (!chanUser.status)
			return chanUser.remove();
		return chanUser.save();
  }

  async ban(user: User): Promise<ChannelUser> {
    const channel = this as Channel;
		const chanUser = await ChannelUser.findOneBy({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
		if (!chanUser || !chanUser.joined)
			throw new NotFoundException("User is not a member of this channel.");
		chanUser.status = ChannelUser.Status.BANNED;
		chanUser.joined = false;
		return chanUser.save();
  }

  async unban(user: User): Promise<ChannelUser> {
    const channel = this as Channel;
    const chanUser = await ChannelUser.findOneBy({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
		if (chanUser?.status === ChannelUser.Status.BANNED)
			return chanUser.remove();
		return chanUser;
  }

  static async createPublicChannel(owner: User, name: string, password?: string): Promise<Channel> {
    if (!name)
      throw new BadRequestException("Channel name is required.")
    if (!!Channel.findOneBy({ name: name }))
      throw new ConflictException("Channel name already in use.")
    return await Channel.create({
      status: Channel.Status.PUBLIC,
      bcrypthash: password ? await bcrypt.hash(password, this.bcryptSaltRounds) : null,
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

	static async createDirectChannel(owner: User, other: User, join: boolean = false): Promise<Channel> {
		return await Channel.save({
			status: Channel.Status.DIRECT,
			users: [
				{
					user: owner,
					status: join ? null : ChannelUser.Status.INVITED,
					joined: join
				},
				{
					user: other,
					status: null,
					joined: false
				}
			]
		});
	}

  static async getDirectChannel(owner: User, other: User, isSenderSide: boolean): Promise<Channel> {
    if ((await User.countBy([owner, other] as FindOptionsWhere<User>)) < 2)
      throw new BadRequestException("wrong user parameters.")
    let channel = await Channel.createQueryBuilder("channel")
      .innerJoin("channel.users","owner")
      .innerJoin("channel.users","other")
      .where("channel.status = :status", { status: Channel.Status.DIRECT })
      .andWhere("owner.userLogin = :ownerLogin", { ownerLogin: owner.ft_login })
      .andWhere("other.userLogin = :otherLogin", { otherLogin: other.ft_login })
      .andWhere("other.status = :otherStatus", { otherStatus: ChannelUser.Status.DIRECT_ALTER })
      .getOne();
    if (channel)
      return channel;
		await this.createDirectChannel(other, owner, !isSenderSide);
		return await this.createDirectChannel(owner, other, isSenderSide);
  }

  static async getPublicList(): Promise<Channel[]> {
    return Channel.find({
      select: Channel.publicFilter,
      where: {
        status: Channel.Status.PUBLIC
      } as FindOptionsWhere<Channel>
    });
  }

  static async getJoinedList(user: User): Promise<ChannelUser[]> {
    return ChannelUser.find({
      relations: {
        channel: true
      },
      select: {
        channel: Channel.publicFilter
      },
      where: {
        user: user,
        joined: true
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
