import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from './user.entity';

@Entity('message')
export class Message extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  time: Date;

  @Column()
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender' })
  sender: User;

  @ManyToOne(() => Channel)
  @JoinColumn({ name: 'channel' })
  channel: Channel;
}
