import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { ChannelUser } from 'src/entities/channeluser.entity';
import { Message } from 'src/entities/message.entity';
import { User } from 'src/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';


@WebSocketGateway()
export class ChatGateway {

  @WebSocketServer() private io: Server;

  async error(client: Socket, msg: string = ''): Promise<any> {
    await client.emit('error', msg);
    return null;
  }

  //  Processes a new message sent by a client (either to a channel or directly to a username)
  //  A Message entity in JSON format is expected as data.
  //
  //  For a direct message, omit channel and set the message <recipient> property as a partial User ( with a user login for example )
  //
  @SubscribeMessage('msg')
  async msg(client: Socket, data: any): Promise<Message> {
    try {
      const user = await User.findOneBy({ft_login: client.data.login});
      let message = Message.create(data);
      message.sender = user;
      if (data.channel) {
        const channel = await Channel.findOneBy(data.channel);
        if (!channel)
          throw new NotFoundException("Message channel was not found !");
        if (channel.status === Channel.Status.DIRECT)
          throw new ForbiddenException("You cannot send a channel message to a direct channel.");
        const chanUser = await ChannelUser.findOneBy({
          channel: channel,
          user: user
        } as FindOptionsWhere<ChannelUser>);
        if (!chanUser || !chanUser.canSpeak())
          throw new ForbiddenException("You cannot speak in this channel !");
				return message.send(data.channel);
      }
      else if (data.recipient) {
        const recipient = await User.findOneBy(data.recipient);
        if (!recipient) {
          console.log('Message recipient was not found !');
          return this.error(client, "Message Recipient was not found !");
        }
				await message.send(await Channel.getDirectChannel(recipient, user, false));
				return message.send(await Channel.getDirectChannel(user, recipient, true));
        // message.channel = await Channel.getDirectChannel(recipient, user, false);
				// this.io.in(channelRoomPrefix + message.channel.id).emit('msg', JSON.stringify(await message.save()));
        // message.channel = await Channel.getDirectChannel(user, recipient, true);
				// message = await message.save();
				// this.io.in(channelRoomPrefix + message.channel.id).emit('msg', JSON.stringify(message));
				// return message;
      }
      else
        return this.error(client, "Invalid message submitted");
    }
    catch (e) {
      this.error(client, e.name + " : " + e.message);
      console.error("[ERROR] " + e.stack)
    }
  }

  @SubscribeMessage('create')
  async create(client: Socket, data: Channel): Promise<Channel> {
    if (data.status === Channel.Status.DIRECT)
      throw new WsException("You cannot create a direct channel.")
    if (data.status === Channel.Status.PROTECTED)
    {
      if (!data.password)
        throw new WsException("A password is required for creating a protected channel")
      data.password = await Channel.hashPassword(data.password);
    }

		return data;
  }

  @SubscribeMessage('join')
  async join(client: Socket, data: Channel) {
    console.log(data);
		return data;
  }

  @SubscribeMessage('publicList')
  async publiclist(client: Socket): Promise<Channel[]> {
    const list = await Channel.getPublicList();
    client.emit('publicList', list);
    return list;
  }

  @SubscribeMessage('unjoinedList')
  async unjoinedList(client: Socket): Promise<Channel[]> {
    const user = await User.findOneBy({ft_login: client.data.login});
    const list = await Channel.getUnjoinedList(user);
    client.emit('unjoinedList', list);
    return list;
  }

  @SubscribeMessage('joinedList')
  async joinedList(client: Socket): Promise<Channel[]> {
    const user = await User.findOneBy({ft_login: client.data.login});
    const list = await Channel.getJoinedList(user);
    client.emit('joinedList', list);
    return list;
  }

  @SubscribeMessage('invitedList')
  async invitedList(client: Socket): Promise<Channel[]> {
    const user = await User.findOneBy({ft_login: client.data.login});
    const list = await Channel.getInvitedList(user);
    client.emit('invitedList', list);
    return list;
  }

  @SubscribeMessage('users')
  async names(client: Socket, data: Channel) {
    console.log(data);
  }

  @SubscribeMessage('mode')
  async mode(client: Socket, data: any) {
    console.log(data);
  }

}
