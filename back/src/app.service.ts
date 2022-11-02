import { Injectable } from '@nestjs/common';
import { User , UserStatus} from 'entities/user.entity';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getUser(): User {
    let connectedClient:User = {
      username: "Kevin", rank: 10, victories: 10, defeats: 5, draws: 3, relations: null,
      ft_login: '',
      status: UserStatus.ONLINE,
      twoFA: '',
      channels: []
    };
    return connectedClient;
  }

  getFriends(name:string): User[] {
    let users:User[] = Array(3);
    for (let i:number = 0; i < 3; i++) {
      users[i] = this.getUser();
      users[i].rank = i;
      users[i].username += i;
    }
    return users;
  }
  getAll(name:string): User[] {
    let users:User[] = Array(16);

    for (let i:number = 0; i < 16; i++) {
      users[i] = this.getUser();
      users[i].rank = i;
      users[i].username += i;
    }
    return users;
  }
}
