import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from './user.entity';

@Entity()
export class Message {

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
  channel: Channel
}
