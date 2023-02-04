import { Entity, PrimaryColumn, Index, Column, OneToMany, BaseEntity, FindOptionsSelect, AfterLoad } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelUser } from './channeluser.entity';
import { UserSocket } from './usersocket.entity';
import { UserRelationship } from './userrelationship.entity';
import { Match } from './match.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

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
  MATCHING = "Matching",
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
    default: null
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

  @Column({ type: 'varchar', length: 7, default: "#370649" })
  boardColor: string;

  @OneToMany(() => UserRelationship, (relationship) => (relationship.owner))
  relationships: UserRelationship[];

  @OneToMany(() => UserRelationship, (relationship) => (relationship.related))
  relatedships: UserRelationship[];

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.user))
  channels: ChannelUser[];

  @OneToMany(() => UserSocket, (socket) => (socket.user))
  sockets: UserSocket[];

  //  Virtual computed field for reliable online status.
  isOnline: boolean;

  //  Virtual field to be able to see a user ongoing match Id if there is one (null if there is none).
  ongoingMatchId: number;

  //  Virtual field to be able to see a user ongoing match Id if there is one (null if there is none).
  xpAmountForNextLevel: number;

  /** MEMBER METHODS */

  @AfterLoad()
  public async computeFields() {
    const ongoingMatch = await Match.findOne({
      where: [
        {
          user1Login: this.ft_login,
          status: Match.Status.ONGOING
        },
        {
          user2Login: this.ft_login,
          status: Match.Status.ONGOING
        },
      ]
    });
    this.ongoingMatchId = ongoingMatch ? ongoingMatch.id : null;
    this.isOnline = ((await UserSocket.countBy({userLogin: this.ft_login})) > 0);
    this.computeXpAmountForNextLevel();
  }

  public computeXpAmountForNextLevel() {
    const x = 0.03;
    const y = 1.5;
    this.xpAmountForNextLevel = Math.floor((this.level / x) ^ y);
  }

  public gainXP(amount: number) {
    amount = Math.floor(amount);
    const rest = this.xpAmountForNextLevel - this.xp;
    if (rest <= amount) {
      ++this.level;
      this.xp = 0;
      amount -= rest;
      this.computeXpAmountForNextLevel();
    }
    this.xp += amount;
    console.log ("[XP] User " + this.username + "(" + this.ft_login + ") gains " + amount + "xp (" + this.xp + "/" + this.xpAmountForNextLevel + " for next lvl).");
  }

  public looseXP(amount: number) {
    amount = Math.floor(amount);
    if (this.xp > amount)
      this.xp -= amount;
    else
      this.xp = 0;
      console.log ("[XP] User " + this.username + "(" + this.ft_login + ") looses " + amount + "xp (" + this.xp + "/" + this.xpAmountForNextLevel + " for next lvl).");
    }

  /** STATIC METHODS */

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
    UserSocket.delete({});
  }

  static async listsUpdate(login: string) {
    await SocketGateway.userEmit(login, 'joinedList', await Channel.joinedList(login));
    await SocketGateway.userEmit(login, 'invitedList', await Channel.invitedList(login));
    await SocketGateway.userEmit(login, 'directList', await Channel.directList(login));
  }

}

export namespace User {
  export import Status = UserStatus;
  export const defaultFilter = userDefaultFilter;
}
