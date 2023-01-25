import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere, FindOptionsSelect, Not, Any } from 'typeorm';
import { User } from './user.entity';
import { ChannelUser } from './channeluser.entity';
import { Message } from './message.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import * as bcrypt from 'bcrypt';
import { channel } from 'diagnostics_channel';

const bcryptSaltRounds = 10;

const channelDefaultFilter: FindOptionsSelect<Channel> = {
  id: true,
  status: true,
  name: true
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

  @OneToMany(() => Message, (msg) => (msg.channel))
  messages: Message[];

  async emitUpdate() {
    if (this.status === Channel.Status.PUBLIC)
      SocketGateway.getIO().emit('publicList', await Channel.publicList());
    const channel = await Channel.getChannel(this.id);
    SocketGateway.channelEmit(this.id, 'channel', channel);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, bcryptSaltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async getChannel(channelId: number): Promise<Channel> {
    return Channel.findOne({
      select: {
        ...Channel.defaultFilter,
        users: {
          user: User.defaultFilter
        },
        messages: true
      },
      relations: {
        users: {
          user:true
        },
        messages: true
      },
      where: {
        id: channelId
      },
      order: {
        messages: {
          time: "ASC"
        }
      }
    });
  }

  static async getDirectChannelId(login1: string, login2: string): Promise<number> {
    let channel = await Channel.createQueryBuilder("channel")
      .innerJoin("channel.users","user1")
      .innerJoin("channel.users","user2")
      .where("channel.status = :status", { status: Channel.Status.DIRECT })
      .andWhere("user1.userLogin = :ownerLogin", { login1 })
      .andWhere("user2.userLogin = :otherLogin", { login2 })
      .getOne();
    if (!channel)
      channel = await Channel.create({
      status: Channel.Status.DIRECT,
      users: [
          {
            userLogin: login1,
            status: ChannelUser.Status.INVITED
          },
          {
            userLogin: login2,
            status: ChannelUser.Status.INVITED
          }
        ]
      }).save();
    return channel.id;
  }

  static async publicList(): Promise<Channel[]> {
    return Channel.find({
      select: Channel.defaultFilter,
      where: {
        status: Any([Channel.Status.PUBLIC, Channel.Status.PROTECTED])
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

  static async directList(login: string): Promise<Channel[]> {
    return Channel.find({
      select: Channel.defaultFilter,
      where: {
        status: Channel.Status.DIRECT,
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
