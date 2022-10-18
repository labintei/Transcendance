import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelStatus } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>
  ) {}

  async createUser(username: string) {
    // Temporary implementation for testing purposes
    const user = new User;
    user.username = username;
    user.ft_login = username;

    await this.userRepository.save(user);
    // users = await this.userRepository.find();
    // console.log(users);

  }

  async deleteUser(username: string) {
    await this.userRepository.delete(username);
  }

  async getUser() : Promise<User[]> {
    return await this.userRepository.find();
  }

  async addMessage() {

  }

  async getMessages(channel: string) {

  }

  async createChannel(channel: string, status: ChannelStatus, password: string = null) {
    const count : number = await this.channelRepository.countBy({name: channel});
    if (count != 0) {
      console.log("Channel " + channel + " already exists.");
      return ;
    }
    const chan = new Channel;
    chan.status = status;
    chan.password = password;
    chan.name = channel;

    // add user to channel
  }

  async addToChannel() {

  }

  async delChannel() {

  }

  async isInChannel(username: string) : Promise<boolean> {

    return true;
  }
}
