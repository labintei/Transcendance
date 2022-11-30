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
    const channel = Channel.create(data);
    delete channel.id;

		return data;
  }

  @SubscribeMessage('join')
  async join(client: Socket, data: Channel) {
    console.log(data);
		return data;
  }

  @SubscribeMessage('publicList')
  async publiclist(client: Socket): Promise<Channel[]> {
    const list = await Channel.find({
      select: Channel.defaultFilter,
      where: {
        status: Not(Channel.Status.DIRECT)
      }
    });
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
      } as FindOptionsWhere<Channel>
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

  @SubscribeMessage('users')
  async names(client: Socket, data: Channel) {
    console.log(data);
  }

  @SubscribeMessage('mode')
  async mode(client: Socket, data: ChannelUser) {
    console.log(data);
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

