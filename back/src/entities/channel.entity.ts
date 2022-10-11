import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';

export enum ChannelStatus {
  PUBLIC = "Public",
  PRIVATE = "Private"
}

@Entity()
export class Channel {

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.PUBLIC
  })
  status: ChannelStatus;

  @Column({
    type: 'varchar',
    nullable: true
  })
  password: string;

  @Column('varchar')
  name: string;

  @OneToMany(() => Message, (msg) => (msg.id))
  messages: Message[];

  @ManyToOne(() => User, (user) => (user.username))
  owner: User;

  @ManyToMany(() => User, (user) => (user.channels))
  users: User[];
}
