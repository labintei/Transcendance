import { Entity, PrimaryColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Channel } from './channel.entity';
import { Message } from './message.entity';

export enum UserStatus {
  ONLINE = "Online",
  OFFLINE = "Offline",
  MATCHING = "Matching",
  PLAYING = "Playing"
}

@Entity()
export class User {

  @PrimaryColumn({
    type: 'varchar',
    length: 24,
    unique: true
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 8,
    unique: true
  })
  ft_login: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ONLINE
  })
  status: UserStatus;

  @Column({
    type: 'varchar',
    nullable: true
  })
  twoFA: string;

  @Column({ type: 'float', default: 0.0 })
  rank: number;

  @Column({ type: 'int', default: 0 })
  victories: number;

  @Column({ type: 'int', default: 0 })
  defeats: number;

  @Column({ type: 'int', default: 0 })
  draws: number;

  @OneToMany(() => User, (friend) => (friend.username))
  friends: Promise<User[]>;

  @OneToMany(() => User, (blocked) => (blocked.username))
  blockeds: Promise<User[]>;

  @OneToMany(() => Message, (msg) => (msg.id))
  messages: Promise<Message[]>;

  @ManyToMany(() => Channel, (chan) => (chan.id))
  @JoinTable()
  channels: Promise<Channel[]>;

  @ManyToMany(() => Channel, (chan) => (chan.id))
  @JoinTable()
  bans: Promise<Channel[]>;

  @ManyToMany(() => Channel, (chan) => (chan.id))
  @JoinTable()
  mutes: Promise<Channel[]>;
}
