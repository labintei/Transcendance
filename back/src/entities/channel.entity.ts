import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere, Not, CannotAttachTreeChildrenEntityError, In, BeforeRemove, FindOptionsSelect } from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';
import { ChannelUser } from './channeluser.entity';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

const bcryptSaltRounds = 10;

const channelDefaultFilter: FindOptionsSelect<Channel> = {
  id: true,
  status: true,
  name: true,
  users: {
    status: true,
    joined: true,
    statusEnd: true,
    user: {
      username: true,
      status: true,
      avatarURL: true,
      level: true,
      xp: true,
      victories: true,
      defeats: true,
      draws: true,
      rank: true
    }
  }
};

enum ChannelStatus {
  DIRECT = "Direct",
  PUBLIC = "Public",
  PROTECTED = "Protected",
  PRIVATE = "Private"
}

@Entity('channel')
export class Channel extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.PUBLIC
  })
  status: ChannelStatus;

  @Column({ type: 'varchar', length: 60, nullable: true })
  password: string; // For password-protected channels

  @Column({ nullable: true, unique: true })
  name: string;

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.channel), { cascade: ["insert"] })
  users: ChannelUser[];

	async setPassword(user: User, password?: string): Promise<Channel> {
    const channel = this as Channel;
		const chanUser = await ChannelUser.findOneBy({
      channel: channel,
      user: user
    } as FindOptionsWhere<ChannelUser>);
		if (!chanUser.isOwner())
			throw new UnauthorizedException("Only the owner of the channel can set the password.");
		this.password = password ? await Channel.hashPassword(password) : null;
		return this.save();
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

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, bcryptSaltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
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
					status: ChannelUser.Status.DIRECT_ALTER,
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

}

export namespace Channel {
  export import Status = ChannelStatus;
  export const defaultFilter = channelDefaultFilter;
}
