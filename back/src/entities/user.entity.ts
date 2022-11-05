import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Entity, PrimaryColumn, Index, Column, OneToMany, getManager, EntityManager, Repository } from 'typeorm';
import { ChannelUser } from './channeluser.entity';
import { UserRelationship } from './userrelationship.entity';

enum UserStatus {
  ONLINE = "Online",
  OFFLINE = "Offline",
  MATCHING = "Matching",
  PLAYING = "Playing"
}

@Entity('user')
export class User {

  constructor(
    @InjectRepository(User)
    private repository
  ) {}

  @PrimaryColumn({ length: 10, unique: true })
  ft_login: string;

  @Index({ unique: true })
  @Column({ length: 24 })
  username: string;

  @Column({
    type: 'enum',
    enum:  UserStatus,
    default: UserStatus.ONLINE
  })
  status: UserStatus;

  @Column({ nullable: true })
  twoFA: string;

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

  @OneToMany(() => UserRelationship, (relationship) => (relationship.owner))
  relationships: UserRelationship[];

  @OneToMany(() => ChannelUser, (chanusr) => (chanusr.user))
  channels: ChannelUser[];

}

export namespace User {

  export import Status = UserStatus;

}
