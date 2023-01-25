import { SocketGateway } from 'src/socket/socket.gateway';
import { Entity, PrimaryColumn, Index, Column, OneToMany, BaseEntity, FindOptionsSelect } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelUser } from './channeluser.entity';
import { UserSocket } from './usersocket.entity';
import { UserRelationship } from './userrelationship.entity';

const userDefaultFilter: FindOptionsSelect<User> = {
  ft_login: true,
  username: true,
  status: true,
  avatarURL: true,
  level: true,
  xp: true,
  victories: true,
  defeats: true,
  draws: true,
  rank: true,
  relationships: {
    related: {
      username: true
    },
    status: true
  },
  relatedships: {
    owner: {
      username: true
    },
    status: true
  }
};

enum UserStatus {
  ONLINE = "Online",
  OFFLINE = "Offline",
  MATCHING = "Matching",
  PLAYING = "Playing",
  BANNED = "Banned"
}

@Entity('user')
@Index(["level", "xp"])
export class User extends BaseEntity {

  @PrimaryColumn({ length: 10, unique: true })
  ft_login: string;

  @Index({ unique: true })
  @Column({ length: 24 })
  username: string;

  @Column({
    type: 'enum',
    enum:  UserStatus,
    default: UserStatus.OFFLINE
  })
  status: UserStatus;

  @Column({ nullable: true })
  avatarURL: string;

  @Column({ nullable: true, length: 32 })
  twoFASecret: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  xp: number

  @Column({ type: 'int', default: 0 })
  victories: number;

  @Column({ type: 'int', default: 0 })
  defeats: number;

  @Column({ type: 'int', default: 0 })
  draws: number;

  @Column({ type: 'int', default: 0 })
  @Index()
  rank: number;

  @Column({ type: 'int', default: 0 })
  bgdChoice: number;

  @Column({ type: 'varchar', length: 7, default: "#FFFFFF" })
  padColor: string;

  @Column({ type: 'varchar', length: 7, default: "#FFFFFF" })
  ballColor: string;

  @Column({ nullable: true })
  socket: string;

  @OneToMany(() => UserRelationship, (relationship) => (relationship.owner))
  relationships: UserRelationship[];

  @OneToMany(() => UserRelationship, (relationship) => (relationship.related))
  relatedships: UserRelationship[];

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.user))
  channels: ChannelUser[];

  @OneToMany(() => UserSocket, (socket) => (socket.user))
  sockets: UserSocket[];

  /** MEMBER METHODS */

  public get xpAmountForNextLevel(): number {
    const x = 0.03;
    const y = 1.5;
    return ((this.level / x) ^ y);
  }

  async gainXP(amount: number): Promise<User> {
    return User.gainXP(this, amount);
  }

  async looseXP(amount: number): Promise<User> {
    return User.looseXP(this, amount);
  }

  async emitUpdate() {
    const joinedList = await Channel.joinedList(this.ft_login);
    for (let channel of joinedList)
      channel.emitUpdate();
  }

  /** STATIC METHODS */

  static async gainXP(user: User, amount: number): Promise<User> {
    const rest = user.xpAmountForNextLevel - user.xp;
    if (rest <= amount) {
      ++user.level;
      user.xp = 0;
      amount -= rest;
    }
    user.xp += amount;
    return user.save();
  }

  static async looseXP(user: User, amount: number): Promise<User> {
    if (user.xp > amount)
      user.xp -= amount;
    else
      user.xp = 0;
    return user.save();
  }

  /*
  **  Retreives the sorted list of all usernames containing the given login
  **  potentially followed (or not) by digits (with a non-zero first one).
  **  A real SQL query is used because of the necessity of ordering by
  **  field length and the limitations of typeorm with SQL sorting options.
  **  This sorted array obtained in result permits to check rapidly for the
  **  first available login(+number) available.
  */
  static async createFrom42Login(login: string, avatarURL: string): Promise<User> {
    const similarusernames = await this.query(`
      SELECT username
      FROM "user"
      WHERE username ~ '^`+login+`([1-9][0-9]*)?$'
      ORDER BY LENGTH(username), username ASC;
    `);
    let i = 0;
    let suffix = '';
    for (let val of similarusernames) {
      if (val.username !== login + suffix)
        break;
      suffix = (++i).toString();
    }
    const user = new User();
    user.username = login + suffix;
    user.ft_login = login;
    user.avatarURL = avatarURL;
    return user.save();
  }

  static async refreshRanks() {
    await this.query(`
      UPDATE "user"
      SET rank = sub.rank
      FROM (
        SELECT
          ft_login,
          ROW_NUMBER()
            OVER(
              ORDER BY
                level DESC,
                xp DESC
            ) AS rank
        FROM "user"
      ) sub
      WHERE "user".ft_login = sub.ft_login
    `);
  }

  static async clearOnlines() {
    User.update({}, { status: User.Status.OFFLINE });
    UserSocket.delete({});
  }
}

export namespace User {
  export import Status = UserStatus;
  export const defaultFilter = userDefaultFilter;
}
