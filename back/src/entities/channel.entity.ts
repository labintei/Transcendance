import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere, FindOptionsSelect, Not } from 'typeorm';
import { User } from './user.entity';
import { ChannelUser } from './channeluser.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import * as bcrypt from 'bcrypt';

const bcryptSaltRounds = 10;

const channelDefaultFilter: FindOptionsSelect<Channel> = {
  id: true,
  status: true,
  name: true,
  users: ChannelUser.defaultFilter
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

  async emitUpdate() {
    if (this.status === Channel.Status.PUBLIC)
      SocketGateway.getIO().emit('publicList', await Channel.publicList());
    const channelWithUsers = await Channel.findOne({
      select: Channel.defaultFilter,
      relations: {
        users: {
          user: true
        }
      },
      where: {
        id: this.id
      }
    });
    SocketGateway.channelEmit(this, 'updateChannel', channelWithUsers);
  }

  async emitDelete() {
    if (this.status === Channel.Status.PUBLIC)
      SocketGateway.getIO().emit('publicList', await Channel.publicList());
    SocketGateway.channelEmit(this, 'deleteChannel', { id:this.id });
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, bcryptSaltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private static async createDirectChannel(owner: User, other: User, join: boolean = false): Promise<Channel> {
    return await Channel.save({
      status: Channel.Status.DIRECT,
      users: [
        {
          user: owner,
          status: join ? ChannelUser.Status.JOINED : ChannelUser.Status.INVITED
        },
        {
          user: other,
          status: ChannelUser.Status.DIRECT_ALTER
        }
      ]
    });
  }

  static async getDirectChannel(owner: User, other: User, isSenderSide: boolean): Promise<Channel> {

    if ((await User.countBy([owner, other] as FindOptionsWhere<User>)) != 2)
      throw new Error("wrong user parameters.")
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

  // async ban(user: User): Promise<ChannelUser> {
  //   const channel = this as Channel;

  //   let chanUser = await ChannelUser.findOneBy({
  //     channel: channel,
  //     user: user
  //   } as FindOptionsWhere<ChannelUser>);
  //   if (!chanUser || !chanUser.joined)
  //     throw new NotFoundException("User is not a member of this channel.");
  //   chanUser.status = ChannelUser.Status.BANNED;
  //   chanUser.joined = false;
  //   return chanUser.save();
  // }

  // async unban(user: User): Promise<ChannelUser> {
  //   const channel = this as Channel;
  //   const chanUser = await ChannelUser.findOneBy({
  //     channel: channel,
  //     user: user
  //   } as FindOptionsWhere<ChannelUser>);
  //   if (chanUser?.status === ChannelUser.Status.BANNED)
  //     return chanUser.remove();
  //   return chanUser;
  // }

  static async publicList(): Promise<Channel[]> {
    return Channel.find({
      select: Channel.defaultFilter,
      where: {
        status: Not(Channel.Status.DIRECT)
      } as FindOptionsWhere<Channel>
    });
  }

  static async joinedList(login: string): Promise<Channel[]> {
    return Channel.find({
      select: Channel.defaultFilter,
      relations: {
        users: {
          user: true
        }
      },
      where: {
        users: {
          userLogin: login,
          status: ChannelUser.Status.JOINED
        }
      }
    });
  }

  static async invitedList(login: string): Promise<Channel[]> {
    return Channel.find({
      select: Channel.defaultFilter,
      where: {
        users: {
          userLogin: login,
          status: ChannelUser.Status.INVITED
        }
      }
    });
  }

}

export namespace Channel {
  export import Status = ChannelStatus;
  export const defaultFilter = channelDefaultFilter;
}
