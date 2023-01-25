import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { ChannelUser } from 'src/entities/channeluser.entity';
import { Message } from 'src/entities/message.entity';
import { User } from 'src/entities/user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { FindOptionsWhere, LessThanOrEqual } from 'typeorm';

@WebSocketGateway()
export class ChatGateway {

  @WebSocketServer() private io: Server;

  private err(client: Socket, event: string, e: Error)
  {
    client.emit('error', "[Event '" + event + "'] " + e.message);
    console.error("[Client '" + client.data.login + "'][Event '" + event + "'] " + e.message);
    console.error(e.stack);
  }

  //  Processes a new message sent by a client (either to a channel or directly to a username)
  //  A Message entity in JSON format is expected as data.
  //
  //  For a direct message, omit channel and set the message <recipient> property as a partial User ( with a user login for example )
  //
  @SubscribeMessage('sendMsg')
  async sendMsg(client: Socket, data: Message): Promise<Message> {
    try {
      data.senderLogin = client.data.login;
      console.log("[sendMsg] : " + JSON.stringify(data));
      if (data.recipientLogin) {
        if (!await User.findOneBy({ft_login: data.recipientLogin}))
          throw new WsException("Direct message recipient was not found !");
        data.channelId = await Channel.getDirectChannelId(data.senderLogin, data.recipientLogin);
      }
      else if (data.channelId) {
        const channel = await Channel.findOneBy({id: data.channelId});
        if (!channel)
          throw new WsException("Message destination channel was not found !");
        if (channel.status === Channel.Status.DIRECT)
          throw new WsException("You cannot send a channel message to a direct channel.");
        const chanUser = await ChannelUser.findOneBy({channelId: data.channelId, userLogin: client.data.login});
        if (!chanUser || !chanUser.canSpeak())
          throw new WsException("You cannot speak in this channel.");
      }
      else
        throw new WsException("Invalid message submitted");
      const message = await Message.create({
        content: data.content,
        senderLogin: data.senderLogin,
        channelId: data.channelId
      }).save();
      SocketGateway.channelEmit(message.channelId, 'msgs', message);
      return message;
    }
    catch (e) {
      this.err(client, 'sendMsg', e);
      return null;
    }
  }

  @SubscribeMessage('createChannel')
  async createChannel(client: Socket, data: Channel): Promise<Channel> {
    try {
      if (!data.name)
        throw new WsException("A channel name is required.")
      if (await Channel.findOneBy({ name: data.name }))
        throw new WsException("this channel name is already taken.")
      if (data.status === Channel.Status.DIRECT || !Object.values(Channel.Status).includes(data.status))
        throw new WsException("Bad channel status.")
      if (data.status === Channel.Status.PROTECTED && !data.password)
        throw new WsException("A password is required for a protected channel")
      const channel = await Channel.create({
        name: data.name,
        status: data.status,
        password: data.password ? await Channel.hashPassword(data.password) : null,
        users: [
          {
            userLogin: client.data.login,
            status: ChannelUser.Status.JOINED,
            rights: ChannelUser.Rights.OWNER
          }
        ]
      }).save();
      delete channel.password;
      this.io.in(client.id).socketsJoin(SocketGateway.channelsToRooms([channel]));
      channel.emitUpdate();
      return channel;
    }
    catch (e) {
      this.err(client, 'createChannel', e);
      return null;
    }
  }

  @SubscribeMessage('updateChannel')
  async updateChannel(client: Socket, data: Channel): Promise<Channel> {
    try {
      let altered = false;
      data.id = Number(data.id);
      if (!Number.isInteger(data.id) || data.id < 0)
        throw new WsException("Invalid channel id");
      let channel = await Channel.findOneBy({ id: data.id });
      if (!channel)
        throw new WsException("Channel was not found.");
      const chanUser = await ChannelUser.findOneBy({ channelId: data.id, userLogin: client.data.login });
      if (!chanUser || !chanUser.isOwner())
        throw new WsException("You are not the owner of this channel.");
      if (data.name && data.name !== channel.name)
      {
        if (await Channel.findOneBy({ name: data.name }))
          throw new WsException("this channel name is already taken.")
        channel.name = data.name;
        altered = true;
      }
      if (data.status && data.status !== channel.status)
      {
        if (data.status === Channel.Status.PUBLIC || data.status === Channel.Status.PRIVATE)
          channel.password = null;
        else if (data.status !== Channel.Status.PROTECTED)
          throw new WsException("Bad channel status.");
        else if (!data.password)
          throw new WsException("Protected channel status requires to provide a password.");
        channel.status = data.status;
        altered = true;
      }
      if (data.password && channel.status === Channel.Status.PROTECTED)
      {
        channel.password = await Channel.hashPassword(data.password);
        altered = true;
      }
      if (altered)
      {
        channel = await channel.save();
        channel.emitUpdate();
      }
      delete channel.password;
      return channel;
    }
    catch (e) {
      this.err(client, 'updateChannel', e);
      return null;
    }
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(client: Socket, data: Channel): Promise<Channel> {
    try {
      if (!data.id && !data.name)
        throw new WsException("You must provide the channel id or name.");
      const channel = await Channel.findOneBy({ id: data.id, name: data.name });
      if (!channel)
        throw new WsException("Channel was not found.");
      let chanUser = await ChannelUser.findOne({
        where: {
          channelId: channel.id,
          userLogin: client.data.login
        }
      });
      if (chanUser) {
        if (chanUser.rights === ChannelUser.Rights.BANNED)
          throw new WsException("You are banned from this channel.");
        if (chanUser.status === ChannelUser.Status.JOINED)
          throw new WsException("You already joined this channel.");
        chanUser.status = ChannelUser.Status.JOINED;
      }
      else
        chanUser = await ChannelUser.create({
          channelId: channel.id,
          userLogin: client.data.login,
          status: ChannelUser.Status.JOINED
        });
      if (channel.status === Channel.Status.DIRECT)
        throw new WsException("You cannot join another person's direct channel.")
      if (channel.status === Channel.Status.PROTECTED) {
        if (!data.password)
          throw new WsException("Protected Channel, password is required.");
        if (!(await Channel.comparePassword(data.password, channel.password)))
          throw new WsException("Channel password does not match.");
      }
      else if (channel.status === Channel.Status.PRIVATE)
        throw new WsException("Channel is private, you must be invited by a channel admin to join.");
      await chanUser.save();
      this.io.in(client.id).socketsJoin(SocketGateway.channelsToRooms([channel]));
      channel.emitUpdate();
      return Channel.findOne({
        select: Channel.defaultFilter,
        relations: {
          users: {
            user: true
          }
        },
        where: {
          id: channel.id
        }
      });
    }
    catch (e) {
      this.err(client, 'joinChannel', e);
      return null;
    }
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(client: Socket, data: Channel): Promise<ChannelUser> {
    try {
      const channel = await Channel.findOneBy({ id: data.id, name: data.name });
      if (!channel)
        throw new WsException("Channel was not found.");
      if (channel.status === Channel.Status.DIRECT)
        throw new WsException("You cannot leave a direct Channel.");
      const chanUser = await ChannelUser.findOne({
        relations: {
          channel: true
        },
        where: {
          channel: channel,
          userLogin: client.data.login
        } as FindOptionsWhere<ChannelUser>
      });
      if (!chanUser)
        throw new WsException("User is not a member of this channel.");
      chanUser.status = null;
      if (!chanUser.rights)
        await chanUser.remove();
      else
        await chanUser.save();
      this.io.in(client.id).socketsLeave(SocketGateway.channelsToRooms([channel]));
      channel.emitUpdate();
      return chanUser
    }
    catch (e) {
      this.err(client, 'leave', e);
      return null;
    }
  }

  @SubscribeMessage('publicList')
  async publiclist(client: Socket): Promise<Channel[]> {
    const list = await Channel.publicList();
    client.emit('publicList', list);
    return list;
  }

  @SubscribeMessage('joinedList')
  async joinedList(client: Socket): Promise<Channel[]> {
    const list = await Channel.joinedList(client.data.login);
    client.emit('joinedList', list);
    return list;
  }

  @SubscribeMessage('invitedList')
  async invitedList(client: Socket): Promise<Channel[]> {
    const list = await Channel.invitedList(client.data.login);
    client.emit('invitedList', list);
    return list;
  }

  /*  TODO  TODO  TODO
  @SubscribeMessage('directList')
  async directList(client: Socket): Promise<Channel[]> {
    const list = await Channel.directList(client.data.login);
    client.emit('invitedList', list);
    return list;
  }*/

  @SubscribeMessage('getChannel')
  async getChannel(client: Socket, data: {channelId: number}): Promise<Channel> {
    try {
      const channel = await Channel.getChannel(data.channelId);
      if (!channel)
        throw new WsException("ChannelId " + data.channelId + " was not found.");
      if (!await ChannelUser.findOneBy({
        channelId: channel.id,
        userLogin: client.data.login,
        status: ChannelUser.Status.JOINED
      }))
        throw new WsException("You are not a member of this Channel.");
      client.emit('channel', channel);
      return channel;
    }
    catch (e) {
      this.err(client, 'getChannel', e);
    }
  }

  @SubscribeMessage('setPermissions')
  async setPermissions(client: Socket, data: ChannelUser) {
    try {
      const channel = await Channel.findOneBy({ id: data.channelId });
      if (!channel)
        throw new WsException("Channel was not found.");
      if (channel.status === Channel.Status.DIRECT)
        throw new WsException("Cannot set user permissions on a direct channel.");
      const ownChanUser = await ChannelUser.findOneBy({channelId: channel.id, userLogin: client.data.login});
      if (!ownChanUser || !ownChanUser.isAdmin())
        throw new WsException("You are not administrator of this channel.");
      const other = await User.findOneBy({ft_login: data.user.ft_login, username: data.user.username});
      if (!other)
        throw new WsException("Target user not found.");
      let otherChanUser = await ChannelUser.findOneBy({
          channel: channel,
          user: other
        } as FindOptionsWhere<ChannelUser>);
      if (!Object.values(ChannelUser.Rights).includes(data.rights))
        throw new WsException("Invalid new channel user rights.");
      if (!Object.values(ChannelUser.Status).includes(data.status))
        throw new WsException("Invalid new channel user status.");
      const endDate = new Date(data.rightsEnd);
      if (isNaN(endDate.getTime()))
        throw new WsException("Invalid new channel user status end date.");
      if (otherChanUser)
      {
        otherChanUser.rights = data.rights;
        otherChanUser.status = data.status;
        otherChanUser.rightsEnd = endDate;
      }
      else
        otherChanUser = ChannelUser.create({
          channel: channel,
          user: other,
          rights: data.rights,
          status: data.status,
          rightsEnd: endDate
        });
      await otherChanUser.save();
      channel.emitUpdate();
      return
    }
    catch (e) {
      this.err(client, 'setPermissions', e);
    }
  }

}
