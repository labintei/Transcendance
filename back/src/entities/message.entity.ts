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

  @ManyToOne(() => User, { orphanedRowAction: "nullify" })
  @JoinColumn({ name: 'sender' })
  sender: User;

  @ManyToOne(() => Channel, { cascade: ["remove"] })
  @JoinColumn({ name: 'channel' })
  channel: Channel;

  static async createMessage(login: string, msg: string, channel: number) {
    const user = await User.findByLogin(login);
    const chan = await Channel.findOneBy({id: channel});

    const message = new Message();
    message.content = msg;
    message.sender = user;
    message.channel = chan;

    // chan.messages ;
    // chan.save();

    return message.save();
  }
}
