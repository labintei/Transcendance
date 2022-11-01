import { Entity, PrimaryColumn, Index, Column, OneToMany } from 'typeorm';
import { ChannelUser } from './channeluser.entity';
import { UserRelation } from './userrelation.entity';

export enum UserStatus {
  ONLINE = "Online",
  OFFLINE = "Offline",
  MATCHING = "Matching",
  PLAYING = "Playing"
}

@Entity('user')
export class User {

  @PrimaryColumn({ length: 8, unique: true })
  ft_login: string;

  @Index({ unique: true })
  @Column({ length: 24 })
  username: string;

  @Column({ default: UserStatus.ONLINE })
  status: UserStatus;

  @Column({ nullable: true })
  twoFA: string;

  @Column({ type: 'float', default: 1 })
  rank: number;

  @Column({ type: 'int', default: 0 })
  victories: number;

  @Column({ type: 'int', default: 0 })
  defeats: number;

  @Column({ type: 'int', default: 0 })
  draws: number;

  @OneToMany(() => UserRelation, (relation) => (relation.owner))
  relations: UserRelation[];

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.user))
  channels: ChannelUser[];
}
