import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { ChannelUser } from 'src/entities/channeluser.entity';
import { Message } from 'src/entities/message.entity';
import { User } from 'src/entities/user.entity';
import { FindOptionsWhere, Not } from 'typeorm';


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
  @SubscribeMessage('message')
  async msg(client: Socket, data: Message): Promise<Message> {
    try {
      const user = await User.findOneBy({ft_login: client.data.login});
      let message = Message.create(data);
      message.sender = user;
      if (data.recipient) {
        const recipient = await User.findOneBy(data.recipient as FindOptionsWhere<User>);
        if (!recipient)
          throw new NotFoundException("Direct message recipient was not found !");
        message.channel = await Channel.getDirectChannel(recipient, user, false);
				await message.send();
        message.channel = await Channel.getDirectChannel(user, recipient, true);
				return message.send();
      }
      else if (data.channel) {
        const channel = await Channel.findOneBy(data.channel as FindOptionsWhere<Channel>);
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
				return message.send();
      }
      else
        return this.error(client, "Invalid message submitted");
    }
    catch (e) {
      this.error(client, e.name + " : " + e.message);
      console.error("[EVENT 'message'][ERROR] " + e.stack)
    }
  }

  @SubscribeMessage('create')
  async create(client: Socket, data: Channel): Promise<Channel> {
    try {
      if (data.status === Channel.Status.DIRECT)
        throw new WsException("You cannot create a direct channel.")
      if (!data.name)
        throw new WsException("A channel name is required.")
      if (await Channel.findOneBy({ name: data.name }))
        throw new WsException("this channel name is already taken.")
      if (data.status === Channel.Status.PROTECTED)
      {
        if (!data.password)
          throw new WsException("A password is required for creating a protected channel")
        data.password = await Channel.hashPassword(data.password);
      }
      else
        delete data.password;
      delete data.id;
      const channel = Channel.create({
        ...data,
        users: [
          {
            userLogin: client.data.login,
            status: ChannelUser.Status.OWNER,
            joined: true
          }
        ]
      });
      return channel.save();
    }
    catch (e) {
      this.error(client, e.name + " : " + e.message);
      console.error("[EVENT 'create'][ERROR] " + e.stack)
    }
  }

  @SubscribeMessage('join')
  async join(client: Socket, data: Channel) {
    try {
      if (!data.id && !data.name)
        throw new NotFoundException("You must provide the channel id or name.");
      const channel = await Channel.findOneBy({ id: data.id, name: data.name });
      if (!channel)
        throw new NotFoundException("Channel was not found.");
      const chanUser = await ChannelUser.findOneBy({ channelId: channel.id, userLogin: client.data.login });
      if (chanUser) {
        if (chanUser.joined)
          return chanUser;
        if (chanUser.status === ChannelUser.Status.BANNED)
          throw new ForbiddenException("You are banned from this channel.");
        if (chanUser.status === ChannelUser.Status.INVITED) {
          chanUser.status = null;
        }
        chanUser.joined = true;
        return chanUser.save();
      }
      if (channel.status === Channel.Status.DIRECT)
        throw new ForbiddenException("You cannot join a direct channel.")
      if (channel.status === Channel.Status.PROTECTED) {
        if (!data.password)
          throw new ForbiddenException("Protected Channel, password is required.");
        if (!(await Channel.comparePassword(data.password, channel.password)))
          throw new ForbiddenException("Channel password does not match.");
      }
      if (channel.status === Channel.Status.PRIVATE)
        throw new ForbiddenException("Channel is private, you must be invited.");
      return ChannelUser.save({
        channelId: channel.id,
        channel: channel,
        userLogin: client.data.login,
        status: null,
        joined: true
      });
    }
    catch (e) {
      this.error(client, e.name + " : " + e.message);
      console.error("[EVENT 'join'][ERROR] " + e.stack)
    }
  }

  @SubscribeMessage('leave')
  async leave(client: Socket, data: Channel) {
    try {
      const chanUser = await ChannelUser.findOne({
        relations: {
          channel: true
        },
        where: [
          {
            channel: {
              name: data.name
            },
            userLogin: client.data.login
          },
          {
            channelId: data.id,
            userLogin: client.data.login
          }
        ]
      });
      if (!chanUser || !chanUser.joined)
        throw new NotFoundException("User is not a member of this channel.");
      chanUser.joined = false;
      if (!chanUser.status)
			  return chanUser.remove();
      return chanUser.save();
    }
    catch (e) {
      this.error(client, e.name + " : " + e.message);
      console.error("[EVENT 'leave'][ERROR] " + e.stack)
    }
  }

  @SubscribeMessage('publicList')
  async publiclist(client: Socket): Promise<Channel[]> {
    const list = await Channel.find({
      select: Channel.defaultFilter,
      where: {
        status: Not(Channel.Status.DIRECT)
      } as FindOptionsWhere<Channel>
    });
    client.emit('publicList', list);
    return list;
  }

  @SubscribeMessage('unjoinedList')
  async unjoinedList(client: Socket): Promise<Channel[]> {
    const list = await Channel.find({
      // MUST USE QUERY BUILDER

      // select: Channel.defaultFilter,
      // where: {
      //   status: Not(Channel.Status.DIRECT)
      // } as FindOptionsWhere<Channel>
    });
    client.emit('unjoinedList', list);
    return list;
  }

  @SubscribeMessage('joinedList')
  async joinedList(client: Socket): Promise<Channel[]> {
    const list = await Channel.find({
      relations: {
        users: true
      },
      select: Channel.defaultFilter,
      where: {
        users: {
          userLogin: client.data.login,
          joined: true
        }
      }
    });
    client.emit('joinedList', list);
    return list;
  }

  @SubscribeMessage('invitedList')
  async invitedList(client: Socket): Promise<Channel[]> {
    const list = await Channel.find({
      relations: {
        users: true
      },
      select: Channel.defaultFilter,
      where: {
        users: {
          userLogin: client.data.login,
          status: ChannelUser.Status.INVITED
        }
      } as FindOptionsWhere<Channel>
    });
    client.emit('invitedList', list);
    return list;
  }

  @SubscribeMessage('mode')
  async mode(client: Socket, data: ChannelUser) {
    // sets a special status of a user to a channel (ban, unban, mute...)
    console.log(data);
  }

}
