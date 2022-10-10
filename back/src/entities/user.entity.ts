import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import { Message } from './message.entity';

export enum UserStatus {
  ONLINE = "Online",
  OFFLINE = "Offline",
  MATCHING = "Matching"
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

  @Column('float')
  rank: number;

  @Column('int')
  victories: number;

  @Column('int')
  defeats: number;

  @Column('int')
  draws: number;

  @OneToMany(() => User, (friend) => (friend.username))
  friends: Promise<User[]>

  @OneToMany(() => User, (blocked) => (blocked.username))
  blockeds: Promise<User[]>

  @OneToMany(() => Message, (msg) => (msg.id))
  messages: Promise<User[]>
}
