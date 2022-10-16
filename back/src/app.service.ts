import { Injectable } from '@nestjs/common';

export type User = {
  username:string;
  rank:number;
  victories:number;
  defeats:number;
  draws:number;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getUser(): User {
    let connectedClient:User = {username:"Kevin", rank:1, victories:10, defeats:5, draws:3};
    return connectedClient;
  }
}
