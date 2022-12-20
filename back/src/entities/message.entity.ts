import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn, BaseEntity, Index, FindOptionsSelect } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from './user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

const messageDefaultFilter: FindOptionsSelect<Message> = {
  time: true,
  content: true,
  sender: {
    username:true
  },
  channel: {
    id: true
  }
};

@Entity('message')
export class Message extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @CreateDateColumn()
  time: Date;

  @Column()
  content: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: 'sender' })
  sender: User;

  @ManyToOne(() => Channel, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  //  Virtual field to specify a direct message recipient.
  recipient: User

  async send(): Promise<Message[]> {
    delete this.id;
    delete this.time;
    await this.save();
    SocketGateway.channelEmit(this.channel, 'msgs', [this]);
    return [this];
  }
}

export namespace Message {
  export const defaultFilter = messageDefaultFilter;
}
