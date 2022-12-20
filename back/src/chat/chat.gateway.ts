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

  private err(client: Socket, event: string, msg: string)
  {
    client.emit('error', "[Event '" + event + "'] " + msg);
    console.error("[Client '" + client.data.login + "'][Event '" + event + "'] " + msg);
  }

  //  Processes a new message sent by a client (either to a channel or directly to a username)
  //  A Message entity in JSON format is expected as data.
  //
  //  For a direct message, omit channel and set the message <recipient> property as a partial User ( with a user login for example )
  //
  @SubscribeMessage('sendMsg')
  async sendMsg(client: Socket, data: Message): Promise<Message[]> {
    try {
      const user = await User.findOneBy({ft_login: client.data.login});
      let message = Message.create(data);
      message.sender = user;
      if (data.recipient) {
        const recipient = await User.findOneBy(data.recipient as FindOptionsWhere<User>);
        if (!recipient)
          throw new WsException("Direct message recipient was not found !");
        message.channel = await Channel.getDirectChannel(recipient, user, false);
				await message.send();
        message.channel = await Channel.getDirectChannel(user, recipient, true);
				return message.send();
      }
      else if (data.channel) {
        const channel = await Channel.findOneBy(data.channel as FindOptionsWhere<Channel>);
        if (!channel)
          throw new WsException("Message channel was not found !");
        if (channel.status === Channel.Status.DIRECT)
          throw new WsException("You cannot send a channel message to a direct channel.");
        const chanUser = await ChannelUser.findOneBy({
          channel: channel,
          user: user
        } as FindOptionsWhere<ChannelUser>);
        if (!chanUser || !chanUser.canSpeak())
          throw new WsException("You cannot speak in this channel !");
				return message.send();
      }
      else
        throw new WsException("Invalid message submitted");
    }
    catch (e) {
      this.err(client, 'sendMsg', e.message);
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
      const channel = await Channel.save({
        name: data.name,
        status: data.status,
        password: data.password ? await Channel.hashPassword(data.password) : null,
        users: [
          {
            userLogin: client.data.login,
            rights: ChannelUser.Rights.OWNER
          }
        ]
      });
      delete channel.password;
      if (channel.status === Channel.Status.PUBLIC)
        this.io.emit('publicList', await Channel.publicList());
      return channel;
    }
    catch (e) {
      this.err(client, 'create', e.message);
      return null;
    }
  }

  @SubscribeMessage('editChannel')
  async alterChannel(client: Socket, data: Channel): Promise<Channel> {
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
      this.err(client, 'editChannel', e.message);
    }
  }

  @SubscribeMessage('join')
  async join(client: Socket, data: Channel): Promise<ChannelUser> {
    try {
      if (!data.id && !data.name)
        throw new WsException("You must provide the channel id or name.");
      const channel = await Channel.findOneBy({ id: data.id, name: data.name });
      if (!channel)
        throw new WsException("Channel was not found.");
      let chanUser = await ChannelUser.findOne({
        select: ChannelUser.defaultFilter,
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
        if (chanUser.status === ChannelUser.Status.INVITED)
        {
          chanUser.status = ChannelUser.Status.JOINED;
          await chanUser.save();
          return chanUser;
        }
      }
      else
        chanUser = ChannelUser.create({
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
      chanUser.save();
      channel.emitUpdate();
      return chanUser;
    }
    catch (e) {
      this.err(client, 'join', e.message);
      return null;
    }
  }

  @SubscribeMessage('leave')
  async leave(client: Socket, data: Channel): Promise<ChannelUser> {
    try {
      const channel = await Channel.findOneBy({ id: data.id, name: data.name });
      if (!channel)
        throw new WsException("Channel was not found.");
      const chanUser = await ChannelUser.findOne({
        relations: {
          channel: true
        },
        where: {
          channel: channel,
          userLogin: client.data.login
        } as FindOptionsWhere<ChannelUser>
      });
      if (!chanUser || chanUser.status === ChannelUser.Status.DIRECT_ALTER)
        throw new WsException("User is not a member of this channel.");
      chanUser.status = null;
      SocketGateway.channelEmit(channel, 'msgs', [channel]);
      if (!chanUser.rights)
        return chanUser.remove();
      return chanUser.save();
    }
    catch (e) {
      this.err(client, 'leave', e.message);
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

  @SubscribeMessage('getMsgs')
  async getMsg(client: Socket, data: {channel: Channel, from: string, count: number}): Promise<Message[]> {
    try {
      const channel = await Channel.findOneBy({ id: data.channel.id, name: data.channel.name });
      if (!channel)
        throw new WsException("Channel was not found.");
      const chanUser = await ChannelUser.findOne({
        relations: {
          channel: true
        },
        where: {
          channel: channel,
          userLogin: client.data.login
        } as FindOptionsWhere<ChannelUser>
      });
      if (!chanUser || chanUser.status !== ChannelUser.Status.JOINED)
        throw new WsException("User is not a member of this channel.");
      const from = data.from ? new Date(data.from) : undefined;
      const count = data.count ? Number(data.count) : undefined;
      const list = await Message.find({
        select: Message.defaultFilter,
        relations: {
          sender: true
        },
        where: {
          channel: channel,
          time: from ? LessThanOrEqual(from) : undefined
        } as FindOptionsWhere<Message>,
        order: {
          time: "DESC"
        },
        take: count ? count : undefined
      });
      client.emit('msgs', list);
      return list;
    }
    catch (e) {
      this.err(client, 'getMsg', e.message);
    }
  }

  @SubscribeMessage('setPermissions')
  async setPermissions(client: Socket, data: ChannelUser) {
    try {
      const channel = await Channel.findOneBy({ id: data.channel.id, name: data.channel.name });
      if (!channel)
        throw new WsException("Channel was not found.");
      if (channel.status === Channel.Status.DIRECT)
        throw new WsException("Cannot set user permissions on a direct channel.");
      const ownChanUser = await ChannelUser.findOneBy({channelId: channel.id, userLogin: client.data.login});
      if (!ownChanUser || !ownChanUser.isAdmin())
        throw new WsException("You are not administrator of this channel.");
      const other = User.findOneBy({ft_login: data.user.ft_login, username: data.user.username});
      if (!other)
        throw new WsException("Target user not found.");
      let otherChanUser = await ChannelUser.findOne({
        relations: {
          channel: true
        },
        where: {
          channel: channel,
          user: {
            ft_login: data.user.ft_login,
            username: data.user.username
          }
        } as FindOptionsWhere<ChannelUser>
      });
      if (!otherChanUser)
        otherChanUser = ChannelUser.create({

        });
    }
    catch (e) {
      this.err(client, 'setPermissions', e.message);
    }
  }

}

// @WebSocketGateway(options)
// export class ChatGateway implements OnGatewayConnection{


//   @WebSocketServer()
//   server: Server;

//   // server.in(theSocketId).socketsJoin("room");

//   login_sid_map = new Map();

//   async handleConnection(@ConnectedSocket() socket) {
//     const query = socket.handshake.auth;
//     console.log("User connected");
//     console.log(query);

//     this.login_sid_map.set(query.ft_login, socket.id);
//     console.log(this.login_sid_map.get(query.ft_login));
//     console.log(this.login_sid_map);
//   }

//   @SubscribeMessage('message')
//   async handleMessage(@ConnectedSocket() socket, @MessageBody() data) {
//     const msg = await Message.createMessage(data.login, data.content, data.id);
//     socket.emit('message', {
//       "sender" : msg.sender.username,
//       "content" : msg.content,
//       "time" : msg.time,
//     });
//   }

//   @SubscribeMessage('loadMessages')
//   async loadMessages(@ConnectedSocket() socket, @MessageBody() data) {
//     // fetch Channel corresponding to id
//     const chan = await Channel.findOneBy({
//       id: data.id
//     } as FindOptionsWhere<Channel>);
//     if (chan === null) {
//       console.error("Invalid id : channel with id #%d does not exist.", data.id);
//       return ;
//     }

//     // fetch Message in appropriate channel
//     const messages = await Message.find({
//       relations: { sender: true, channel: true },
//       where: {
//         channel: chan
//       } as FindOptionsWhere<Message>});
//     if (messages === undefined) {
//       console.log("No messages");
//       return ;
//     }

//     // organize data before sending
//     const messagesToSend = messages.map((msg) => {
//       return ({
//         "sender" : msg.sender.username,
//         "content" : msg.content,
//         "time" : msg.time
//       })
//     })

//     socket.emit('loadMessages', messagesToSend);
//   }

//   @SubscribeMessage('getChannels')
//   async getChannel(@ConnectedSocket() socket, @MessageBody() data) {
//     // console.log('debug #2');
//     const chans = await Channel.find();

//     // console.log(data);

//     const user = await User.findByUsername(data.user);
//     const user2 = await User.findByLogin('lratio');
//     const chan = await Channel.findOneBy({name: "#ilovec"});

//     const chansToSend = chans.map((channel) => {
//       return ({
//         "id": channel.id,
//         "name": channel.name,
//         "status": channel.status
//       })
//     })

//     // console.log(chansToSend)

//     socket.emit('getChannels', chansToSend);
//   }
// }


// import { InjectRepository } from '@nestjs/typeorm';
// import {
//   ConnectedSocket,
//   MessageBody,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer
// } from '@nestjs/websockets';
// import { User } from 'src/entities/user.entity';

// const options = {
//   cors: {
//     origin: "*",    // TEMPORARY: BAD PRACTICE
//   }
// }

// @WebSocketGateway(options)
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   constructor() {}

//   @WebSocketServer() server;
//   @InjectRepository(User) userRep;

//   nbUser: number = 0;

//   messages : object[][] = [];

//   async handleConnection(@ConnectedSocket() socket) {
//     const query = socket.handshake.query;
//     console.log("User connected");
//     this.nbUser++;

//     // await this.chatService.createUser(query.username);
//   }

//   async handleDisconnect(@ConnectedSocket() socket) {
//     const query = socket.handshake.query;
//     console.log("User disconnected");
//     this.nbUser--;

//     // await this.chatService.deleteUser(query.username);
//   }

//   @SubscribeMessage('message')
//   async sendMessage(@ConnectedSocket() socket, @MessageBody() data) {
//     // data.time
//     // data.content
//     // data.sender
//     // data.channel ?

//     console.log(data);
 
//     socket.emit('message', {"user":"bob", "key":12})

//     // const users = await this.chatService.getUser();

//     // socket.emit('message', users);

//     // register in database
//     // emit.to.room(msg)
//   }

//   @SubscribeMessage('getChannels')
//   getChannel(@ConnectedSocket() socket, @MessageBody() data) {
//     console.log("getChannel event fired up");
//     socket.emit('getChannels', [
//       {"id":1, "name":"general", "status":"public"},
//       {"id":2, "name":"private", "status":"private"},
//       {"id":3, "name":"bob", "status":"direct"},
//       {"id":4, "name":"alice", "status":"direct"},
//       {"id":5, "name":"secret", "status":"private"},
//     ]);
//   }

//   @SubscribeMessage('create')
//   createChannel(@MessageBody() data) {
//     // data.sender
//     // data.channel
//     // data.type // public or private
//     // data.password

//     // check chan doesnt already exist // is check necessary
//     // create it
//     // else
//     // return error
//   }

//   @SubscribeMessage('join')
//   joinChannel(@MessageBody() data) {
//     // data.sender // probably cookie/token or sth
//     // data.target // chan name

//     // check if chan exist
//     //    join it (check perms)
//     // emit.to.room(new user just dropped)
//   }

//   @SubscribeMessage('leave')
//   leaveChannel(@MessageBody() data) {
//     // data.sender // probably cookie/token or sth
//     // data.target // chan name

//     //  if chan is now empty, prune it from db
//   }

//   @SubscribeMessage('block')
//   blockUser(@MessageBody() data) {
//     // data.sender // probably cookie/token or sth
//     // data.target // chan name
//     // data.set // true/false to set unset

//     // access db
//   }

//   @SubscribeMessage('ban')
//   banUserFromChan(@MessageBody() data) {
//     // sender name
//     // chanel name
//     // target name
//     // timestamp

//     // if sender is in channel and sender is admin
//     // ban
//   }

//   @SubscribeMessage('mute')
//   muteUserFromChan(@MessageBody() data) {
//     // sender name
//     // chanel name
//     // target name
//     // timestamp

//     // if sender is in channel and sender is admin
//     // mute
//   }

//   @SubscribeMessage('loadMessages')
//   loadMessages(@ConnectedSocket() socket, @MessageBody() data) {
//     // target chan or msg

//     if (this.messages[0] === undefined)
//       this.messages[0] = [];

//     console.log("Loading messages for channel", data);

//     this.messages[0].push({"sender": "bob", "content":"hello", "time": new Date()});

//     console.log(this.messages[0]);
  
//     const key : string = data.toString();
//     socket.emit('loadMessages', [
//       this.messages[0][0],
//       {"sender": "From chan " + key, "content":"hello world !", "time": new Date()},
//       {"sender": "From chan " + key, "content":"hello world !", "time": new Date()},
//       {"sender": "From chan " + key, "content":"hello world !", "time": new Date(25)},
//       {"sender": "From chan " + key, "content":"hello world !", "time": new Date(1000)},
//     ]);

//     // fetch all messages from db
//     // return messages
//   }

//   @SubscribeMessage('setAdmin')
//   setAdmin(@MessageBody() data) {
//     // sender name
//     // channel name
//     // target name
//     // to_set : true/false

//     // if sender is in channel and sender is admin
//     // set/unset
//   }
// }

