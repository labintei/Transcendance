import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { emit } from 'process';
import { User } from 'src/entities/user.entity';
import { ChatService } from './chat.service';

const options = {
  cors: {
    origin: "*",    // TEMPORARY: BAD PRACTICE
  }
}

@WebSocketGateway(options)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}

  @WebSocketServer() server;
  @InjectRepository(User) userRep;

  nbUser: number = 0;

  async handleConnection(@ConnectedSocket() socket) {
    const query = socket.handshake.query;

    this.nbUser++;

    await this.chatService.createUser(query.username);
  }

  async handleDisconnect(@ConnectedSocket() socket) {
    const query = socket.handshake.query;

    this.nbUser--;

    await this.chatService.deleteUser(query.username);
  }

  @SubscribeMessage('message')
  async sendMessage(@ConnectedSocket() socket, @MessageBody() data) {
    // data.time
    // data.content
    // data.sender
    // data.channel ?

    console.log(data);

    // const users = await this.chatService.getUser();

    // socket.emit('message', users);

    // register in database
    // emit.to.room(msg)
  }

  @SubscribeMessage('create')
  createChannel(@MessageBody() data) {
    // data.sender
    // data.channel
    // data.type // public or private
    // data.password

    // check chan doesnt already exist // is check necessary
    // create it
    // else
    // return error
  }

  @SubscribeMessage('join')
  joinChannel(@MessageBody() data) {
    // data.sender // probably cookie/token or sth
    // data.target // chan name

    // check if chan exist
    //    join it (check perms)
    // emit.to.room(new user just dropped)
  }

  @SubscribeMessage('leave')
  leaveChannel(@MessageBody() data) {
    // data.sender // probably cookie/token or sth
    // data.target // chan name

    //  if chan is now empty, prune it from db
  }

  @SubscribeMessage('block')
  blockUser(@MessageBody() data) {
    // data.sender // probably cookie/token or sth
    // data.target // chan name
    // data.set // true/false to set unset

    // access db
  }

  @SubscribeMessage('ban')
  banUserFromChan(@MessageBody() data) {
    // sender name
    // chanel name
    // target name
    // timestamp

    // if sender is in channel and sender is admin
    // ban
  }

  @SubscribeMessage('mute')
  muteUserFromChan(@MessageBody() data) {
    // sender name
    // chanel name
    // target name
    // timestamp

    // if sender is in channel and sender is admin
    // mute
  }

  @SubscribeMessage('load')
  loadMessages(@MessageBody() data) {
    // target chan or msg

    // fetch all messages from db
    // return messages
  }

  @SubscribeMessage('setAdmin')
  setAdmin(@MessageBody() data) {
    // sender name
    // channel name
    // target name
    // to_set : true/false

    // if sender is in channel and sender is admin
    // set/unset
  }
}
