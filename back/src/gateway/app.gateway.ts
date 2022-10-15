import {ConnectedSocket,
            MessageBody,
            OnGatewayConnection,
            OnGatewayDisconnect,
            SubscribeMessage,
            WebSocketGateway,
            WebSocketServer
} from '@nestjs/websockets';
import {Socket} from 'socket.io';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';


    //andleConnection(client: T, ...args: any[]): any;



@WebSocketGateway(3000)
export class BackGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server;
    users: number = 0;

    //async handleConnection(client: TemplateStringsArray, ..args: any[]): any;

    async handleConnection(socket:Socket){
        console.log("conneted");
    }

    async handleDisconnect(@ConnectedSocket() socket) {
        console.log(socket.id);
        console.log(socket);
    }

    @SubscribeMessage('message')
    sendMessage(@MessageBody() data)
    {
        console.log(data);
    }

    @SubscribeMessage('create')
    createchannel(@MessageBody() data)
    {
        console.log(data)
    }

}