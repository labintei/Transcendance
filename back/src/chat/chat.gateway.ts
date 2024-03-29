import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { ChannelUser } from 'src/entities/channeluser.entity';
import { Message } from 'src/entities/message.entity';
import { User } from 'src/entities/user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

@WebSocketGateway()
export class ChatGateway {

  @WebSocketServer() private io: Server;

  private err(client: Socket, event: string, e: Error)
  {
    client.emit('error', "[Event '" + event + "'] " + e.message);
    //console.log("[debug] error message to client " + client.data.login + " [id:" + client.id + "] " + e.message);
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
      if (data.recipientLogin) {
        if (!await User.findOneBy({ft_login: data.recipientLogin}))
          throw new WsException("Direct message recipient was not found !");
        data.channelId = await Channel.getDirectChannelId(data.senderLogin, data.recipientLogin);
      }
      else if (data.channelId) {
        const channel = await Channel.findOneBy({id: data.channelId});
        if (!channel)
          throw new WsException("Channel id (" + data.id + ") was not found.");
        const chanUser = await ChannelUser.findOneBy({channelId: data.channelId, userLogin: client.data.login});
        if (chanUser.rights === ChannelUser.Rights.MUTED) {
          const interval = new Date(chanUser.rightsEnd.getTime() - Date.now());
          const intervalString = (interval.getUTCHours() ? interval.getUTCHours().toString() + "hrs " : "")
            + (interval.getUTCHours() || interval.getUTCMinutes() ? interval.getUTCMinutes().toLocaleString('fr-FR', {minimumIntegerDigits: 2, useGrouping:false}) + "min " : "")
            + interval.getUTCSeconds().toLocaleString('fr-FR', {minimumIntegerDigits: 2, useGrouping:false}) + "sec";
          throw new WsException("Sorry, you have been muted here (" + intervalString + " remaining)" );
        }
        if (!chanUser?.canSpeak())
          throw new WsException("You cannot speak in this channel.");
      }
      else
        throw new WsException("Invalid message submitted");
      const message = await Message.create({
        content: data.content,
        senderLogin: data.senderLogin,
        channelId: data.channelId
      }).save();
      message.sender = await User.findOne({
        select: User.defaultFilter,
        where: {
          ft_login: data.senderLogin
        }
      });
      SocketGateway.channelEmit(message.channelId, 'message', message);
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
      const exists = await Channel.findOneBy({ name: data.name });
      if (exists && exists.id !== data.id)
        throw new WsException("This channel name is already taken.")
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
      data.id = Number(data.id);
      if (!Number.isInteger(data.id) || data.id < 0)
        throw new WsException("Invalid channel id");
      let channel = await Channel.findOneBy({ id: data.id });
      if (!channel)
        throw new WsException("Channel id (" + data.id + ") was not found.");
      const chanUser = await ChannelUser.findOneBy({ channelId: data.id, userLogin: client.data.login });
      if (!chanUser || !chanUser.isOwner())
        throw new WsException("You are not the owner of this channel.");
      let altered = false;
      if (data.name && data.name !== channel.name)
      {
        if (await Channel.findOneBy({ name: data.name }))
          throw new WsException("This channel name is already taken.");
        channel.name = data.name;
        altered = true;
      }
      if (data.status && data.status !== channel.status)
      {
        if (data.status === Channel.Status.DIRECT || !Object.values(Channel.Status).includes(data.status))
          throw new WsException("Bad channel status.")
        channel.status = data.status;
        if (channel.status !== Channel.Status.PROTECTED)
          channel.password = null;
        altered = true;
      }
      if (data.password !== undefined)
      {
        if (channel.status !== Channel.Status.PROTECTED)
          throw new WsException("Only protected channels can have a password.");
        if (data.password)
          channel.password = await Channel.hashPassword(data.password);
        else
          channel.password = null;
        altered = true;
      }
      if (altered)
        channel = await channel.save();
      delete channel.password;
      if (altered)
        channel.emitUpdate();
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
      data.id = Number(data.id);
      if (!Number.isInteger(data.id) || data.id < 0)
        throw new WsException("Invalid channel id");
      const channel = await Channel.findOneBy({ id: data.id });
      if (!channel)
        throw new WsException("Channel id (" + data.id + ") was not found.");
      if (channel.status === Channel.Status.DIRECT)
        throw new WsException("You cannot join a direct channel.");
      let chanUser = await ChannelUser.findOne({
        where: {
          channelId: channel.id,
          userLogin: client.data.login
        }
      });
      if (chanUser?.status === ChannelUser.Status.JOINED)
        throw new WsException("You already joined this channel.");
      if (chanUser?.rights === ChannelUser.Rights.BANNED)
        throw new WsException("You are banned from this channel.");
      if (channel.status === Channel.Status.PRIVATE && chanUser?.status !== ChannelUser.Status.INVITED)
        throw new WsException("You must be invited to join a private channel");
      if (channel.status === Channel.Status.PROTECTED && chanUser?.status !== ChannelUser.Status.INVITED) {
        if (!data.password)
          throw new WsException("Protected Channel, password is required.");
        if (!(await Channel.comparePassword(data.password, channel.password)))
          throw new WsException("Channel password does not match.");
      }
      if (!chanUser)
        chanUser = ChannelUser.create({
          channelId: channel.id,
          userLogin: client.data.login
        });
      chanUser.status = ChannelUser.Status.JOINED;
      await chanUser.save();
      this.io.in(client.id).socketsJoin(SocketGateway.channelsToRooms([channel]));
      channel.contentUpdate();
      return Channel.getChannelWithUsersAndMessages(channel.id);
    }
    catch (e) {
      this.err(client, 'joinChannel', e);
      return null;
    }
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(client: Socket, data: Channel): Promise<boolean> {
    try {
      data.id = Number(data.id);
      if (!Number.isInteger(data.id) || data.id < 0)
        throw new WsException("Invalid channel id");
      let channel = await Channel.findOneBy({ id: data.id });
      if (!channel)
        throw new WsException("Channel id (" + data.id + ") was not found.");
      if (channel.status === Channel.Status.DIRECT)
        throw new WsException("You cannot leave a direct Channel.");
      let chanUser = await ChannelUser.findOneBy({
        channelId: channel.id,
        userLogin: client.data.login
      });
      if (!chanUser || chanUser.status !== ChannelUser.Status.JOINED)
        throw new WsException("You are not a member of this channel.");
      let removeChannel = false;
      if (chanUser.isOwner()){
        const newOwner = await channel.getNewOwner();
        if (newOwner) {
          newOwner.rights = ChannelUser.Rights.OWNER;
          await newOwner.save();
        }
        else {
          await SocketGateway.channelEmit(channel.id, 'hideChannel', {id: channel.id});
          await SocketGateway.allChannelLeavesRoom(channel.id);
          await channel.remove();
          return true;
        }
        chanUser.rights = null;
      }
      await SocketGateway.userEmit(chanUser.userLogin, 'hideChannel', {id: chanUser.channelId});
      await SocketGateway.userLeaveChannelRoom(chanUser.userLogin, chanUser.channelId);
      await channel.emitUpdate();
      if (!chanUser.rights)
        await chanUser.remove();
      else
        await chanUser.save();
      return true;
    }
    catch (e) {
      this.err(client, 'leaveChannel', e);
      return null;
    }
  }

  @SubscribeMessage('publicList')
  async publiclist(client: Socket): Promise<Channel[]> {
    const list = await Channel.publicList();
    SocketGateway.userEmit(client.data.login, 'publicList', list);
    return list;
  }

  @SubscribeMessage('joinedList')
  async joinedList(client: Socket): Promise<Channel[]> {
    const list = await Channel.joinedList(client.data.login);
    SocketGateway.userEmit(client.data.login, 'joinedList', list);
    return list;
  }

  @SubscribeMessage('invitedList')
  async invitedList(client: Socket): Promise<Channel[]> {
    const list = await Channel.invitedList(client.data.login);
    SocketGateway.userEmit(client.data.login, 'invitedList', list);
    return list;
  }

  @SubscribeMessage('directList')
  async directList(client: Socket): Promise<Channel[]> {
    const list = await Channel.directList(client.data.login);
    SocketGateway.userEmit(client.data.login, 'directList', list);
    return list;
  }

  @SubscribeMessage('getChannel')
  async getChannel(client: Socket, data: Channel): Promise<Channel> {
    try {
      data.id = Number(data.id);
      if (!Number.isInteger(data.id) || data.id < 0)
        throw new WsException("Invalid channel id");
      const channel = await Channel.getChannelWithUsersAndMessages(data.id);
      if (!channel)
        throw new WsException("ChannelId " + data.id + " was not found.");
      if (!await ChannelUser.findOneBy({
        channelId: channel.id,
        userLogin: client.data.login,
        status: ChannelUser.Status.JOINED
      }))
        throw new WsException("You are not a member of this Channel.");
      return channel;
    }
    catch (e) {
      this.err(client, 'getChannel', e);
      return null;
    }
  }

  @SubscribeMessage('getDirectChannel')
  async getDirectChannel(client: Socket, data: User): Promise<Channel> {
    try {
      const other = await User.findOneBy({ft_login: data.ft_login});
      if (!other)
        throw new WsException("User " + data.ft_login + " was not found.");
      const channelId = await Channel.getDirectChannelId(client.data.login, other.ft_login);
      const channel = await Channel.getChannelWithUsersAndMessages(channelId);
      if (!channel)
        throw new WsException("ChannelId " + channelId + " was not found.");
      return channel;
    }
    catch (e) {
      this.err(client, 'getDirectChannel', e);
      return null;
    }
  }  

  @SubscribeMessage('setPermissions')
  async setPermissions(client: Socket, data: ChannelUser): Promise<ChannelUser> {
    try {
      const channel = await Channel.findOneBy({ id: data.channelId });
      if (!channel)
        throw new WsException("Channel was not found.");
      const user = await User.findOneBy({ ft_login: (data.userLogin !== undefined ? data.userLogin : data.user.ft_login), username: data.user?.username });
      if (!user)
        throw new WsException("Target User was not found.");
      const ownStatus = await ChannelUser.findOneBy({channelId: channel.id, userLogin: client.data.login});
      if (!ownStatus?.isAdmin())
        throw new WsException("You are not an administrator of this channel.");
      if (user.ft_login === client.data.login)
        throw new WsException("You cannot change you own channel permissions.");
      if (data.rights !== null && !Object.values(ChannelUser.Rights).includes(data.rights))
        throw new WsException("Invalid user rights.");
      if (data.status !== null && !Object.values(ChannelUser.Status).includes(data.status))
        throw new WsException("Invalid user status.");
      if (data.rightsEnd) {
        const endDate = new Date(data.rightsEnd);
        if (isNaN(endDate.getTime()))
          throw new WsException("Invalid end date.");
        if ((endDate.getTime() - Date.now()) > 2147483647)
          throw new WsException("Sadly, you cannot set user rights for much more than 20hrs 30min.");
        data.rightsEnd = endDate;
      }
      let chanUser = await ChannelUser.findOneBy({
        channelId: channel.id,
        userLogin: user.ft_login
      });
      if (!chanUser)
        chanUser = ChannelUser.create({
          status: null,
          rights: null,
          rightsEnd: null,
          channelId: channel.id,
          userLogin: user.ft_login
        });
      if (data.status === ChannelUser.Status.INVITED && chanUser?.status)
        throw new WsException("This user is a member or has already been invited.");
      if ((data.rights === undefined || data.rights === chanUser?.rights)
        && (data.status === undefined || data.status === chanUser?.status)
        && (data.rightsEnd === undefined || data.rightsEnd === chanUser?.rightsEnd))
        throw new WsException("No changes in user permissions.");
      if (data.status === ChannelUser.Status.JOINED && data.status !== chanUser.status)
        throw new WsException("You cannot force people to join your channel ;-)");
      if (chanUser.isOwner())
        throw new WsException("Nobody can change the owner permissions.");
      if (!ownStatus.isOwner()
        && (chanUser.isAdmin()
          || data.rights == ChannelUser.Rights.ADMIN
          || data.rights == ChannelUser.Rights.OWNER))
        throw new WsException("You must be the owner to set an administrator permissions.");
      if (!ownStatus.isAdmin())
        throw new WsException("You must be an administrator to set a user permissions.");
      if (data.rights !== undefined && data.rights !== chanUser.rights) {
        chanUser.rights = data.rights;
        if (chanUser.rights === ChannelUser.Rights.BANNED && chanUser.status)
          data.status = null;
        chanUser.rightsEnd = null;
      }
      if (data.rightsEnd !== undefined && data.rightsEnd !== chanUser.rightsEnd)
        chanUser.rightsEnd = data.rightsEnd;
      if (data.status !== undefined && data.status !== chanUser.status) {
        chanUser.status = data.status;
        if (data.status === null)
          await SocketGateway.userEmit(chanUser.userLogin, 'hideChannel', {id: chanUser.channelId});
        await channel.emitUpdate();
      }
      if (chanUser.isOwner())
      {
        ownStatus.rights = ChannelUser.Rights.ADMIN;
        await ownStatus.save();
      }
      if (!chanUser.status && !chanUser.rights)
        chanUser = await chanUser.remove();
      else
        chanUser = await chanUser.save();
      await chanUser.updateRightsTimeout();
      await User.listsUpdate(user.ft_login);
      await channel.contentUpdate();
      return chanUser;
    }
    catch (e) {
      this.err(client, 'setPermissions', e);
      return null;
    }
  }

}
