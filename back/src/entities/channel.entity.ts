import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere, FindOptionsSelect, Not, Any, IsNull } from 'typeorm';
import { User } from './user.entity';
import { ChannelUser } from './channeluser.entity';
import { Message } from './message.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import * as bcrypt from 'bcrypt';

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

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.channel), { onDelete: "CASCADE", cascade: ["insert"] })
  users: ChannelUser[];

  @OneToMany(() => Message, (msg) => (msg.channel))
  messages: Message[];

  async emitUpdate() {
    const fullChannel = await Channel.getChannelWithUsersAndMessages(this.id);
    if (fullChannel.status === Channel.Status.PUBLIC)
      SocketGateway.getIO().emit('publicList', await Channel.publicList());
    SocketGateway.channelEmit(this.id, 'channel', fullChannel);
  }

  async getNewOwner(): Promise<ChannelUser> {
    let newOwner = await ChannelUser.findOne({
      where: {
        channelId: this.id,
        rights: ChannelUser.Rights.ADMIN,
        status: ChannelUser.Status.JOINED
      },
      order: {
        updated: "DESC"
      }
    });
    if (!newOwner)
      newOwner = await ChannelUser.findOne({
        where: {
          channelId: this.id,
          rights: IsNull(),
          status: ChannelUser.Status.JOINED
        },
        order: {
          updated: "DESC"
        }
      });
    if (!newOwner)
      newOwner = await ChannelUser.findOne({
        where: {
          channelId: this.id,
          status: ChannelUser.Status.JOINED
        },
        order: {
          updated: "DESC"
        }
      });
    return newOwner;
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, bcryptSaltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async getChannelWithUsersAndMessages(channelId: number): Promise<Channel> {
    const channel = await Channel.findOne({
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
    delete channel.password;
    return channel;
  }

  static async getDirectChannelId(login1: string, login2: string): Promise<number> {
    let channel = await Channel.createQueryBuilder("channel")
      .innerJoin("channel.users","user1")
      .innerJoin("channel.users","user2")
      .where("channel.status = :status", { status: Channel.Status.DIRECT })
      .andWhere("user1.userLogin = :ownerLogin", { login1 })
      .andWhere("user2.userLogin = :otherLogin", { login2 })
      .getOne();
    if (!channel) {
      channel = await Channel.create({
      status: Channel.Status.DIRECT,
      users: [
          {
            userLogin: login1,
            status: ChannelUser.Status.JOINED
          },
          {
            userLogin: login2,
            status: ChannelUser.Status.JOINED
          }
        ]
      }).save();
      SocketGateway.userJoinRooms(login1, SocketGateway.channelsToRooms([channel]));
      SocketGateway.userJoinRooms(login2, SocketGateway.channelsToRooms([channel]));
    }
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
      select: {
        ...Channel.defaultFilter,
        users: {
          user: User.defaultFilter
        }
      },
      relations: {
        users: true
      },
      where: {
        status: Channel.Status.DIRECT,
        users: {
          userLogin: login
        }
      }
    });
  }

}

export namespace Channel {
  export import Status = ChannelStatus;
  export const defaultFilter = channelDefaultFilter;
}
