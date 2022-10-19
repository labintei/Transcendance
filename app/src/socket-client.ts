import { Injectable, OnModuleInit } from 'nestjs/common'
import { id, Socket} from 'socket.io-client'

@Injectable()
export class SocketClient implements OnModuleInit {
    public socketClient: Socket;

    constructor() {
        this.socketClient = id('http://localhost:3000');
    }

    onModuleInit() {
        this.registerConsumerEvents();
    }

    private registerConsumerEvents() {
        this.socketClient.on('connect', () => {
            console.log('Connected to Gateway');
        });
        this.socketClient.on('anMessage', (payload: any) => {
            console.log('SocketClientClass');
            console.log(payload);
        });
    }
}