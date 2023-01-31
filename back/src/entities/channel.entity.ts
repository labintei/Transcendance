import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, FindOptionsWhere, FindOptionsSelect, Any, IsNull, Index, AfterRemove, Not, AfterUpdate} from 'typeorm';
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

  @Index()
  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.PUBLIC
  })
  status: ChannelStatus;

  @Column({ type: 'varchar', length: 60, nullable: true })
  password: string; // For password-protected channels

  @Index()
  @Column({ nullable: true, unique: true })
  name: string;

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.channel), { onDelete: "CASCADE", cascade: ["insert"] })
  users: ChannelUser[];

  @OneToMany(() => Message, (msg) => (msg.channel))
  messages: Message[];

  @AfterRemove()
  async refreshListIfPublic() {
    if (this.status === Channel.Status.PUBLIC)
      SocketGateway.getIO().emit('publicList', await Channel.publicList());
  }

  async emitUpdate() {
    await this.refreshListIfPublic();
    await this.userListUpdate();
  }

  async userListUpdate() {
    if (this.id)
      Channel.userListUpdate(this.id);
  }

  static async userListUpdate(channelId: number) {
    await SocketGateway.channelEmit(channelId, 'updateChannel', {id: channelId});
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
          rights: ChannelUser.Rights.MUTED,
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
      select: Channel.defaultFilter,
      where: {
        id: channelId
      }
    });
    channel.users = await ChannelUser.find({
      select: {
        user: User.defaultFilter
      },
      relations: {
        user: true
      },
      where: {
        channelId: channel.id,
        status: ChannelUser.Status.JOINED
      },
      order: {
        rights: "ASC"
      }
    });
    channel.messages = await Message.find({
      select: {
        id: true,
        time: true,
        content: true,
        sender: User.defaultFilter
      },
      relations: {
        sender: true
      },
      where: {
        channelId: channel.id
      },
      order: {
        time: "ASC"
      }
    });
    return channel;
  }

  static async getDirectChannelId(login1: string, login2: string): Promise<number> {
    let channel = await Channel.createQueryBuilder("channel")
      .innerJoin("channel.users","user1")
      .innerJoin("channel.users","user2")
      .where("channel.status = :status", { status: Channel.Status.DIRECT })
      .andWhere("user1.userLogin = :ownerLogin", { ownerLogin: login1 })
      .andWhere("user2.userLogin = :otherLogin", { otherLogin: login2 })
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
      await SocketGateway.userJoinRooms(login1, SocketGateway.channelsToRooms([channel]));
      await SocketGateway.userJoinRooms(login2, SocketGateway.channelsToRooms([channel]));
      channel.emitUpdate();
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
      where: {
        status: Not(Channel.Status.DIRECT),
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
    const list = await Channel.find({
      select: Channel.defaultFilter,
      where: {
        status: Channel.Status.DIRECT,
        users: {
          userLogin: login
        },
      }
    });
    for (let channel of list) {
      channel.users = [
        await ChannelUser.findOne({
          select: {
            user: User.defaultFilter
          },
          relations: {
            user: true
          },
          where: {
            channelId: channel.id,
            userLogin: Not(login)
          }
        }),
        await ChannelUser.findOne({
          select: {
            user: User.defaultFilter
          },
          relations: {
            user: true
          },
          where: {
            channelId: channel.id,
            userLogin: login
          }
        })
      ];
    }
    return list;
  }

}

export namespace Channel {
  export import Status = ChannelStatus;
  export const defaultFilter = channelDefaultFilter;
}
