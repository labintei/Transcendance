import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn, BaseEntity, Index, FindOptionsSelect } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from './user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

@Entity('message')
export class Message extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @CreateDateColumn()
  time: Date;

  @Column()
  content: string;

  @Column({ name: 'sender' })
  senderLogin: string;

  @Column({ name: 'channel' })
  channelId: number;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: 'sender' })
  sender: User;

  @ManyToOne(() => Channel, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  //  Virtual field to specify a direct message recipient.
  recipientLogin: string
  
}
