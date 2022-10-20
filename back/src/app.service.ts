import { Injectable } from '@nestjs/common';
import { User , UserStatus} from 'entities/user.entity';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getUser(): User {
    let connectedClient:User = {
      username: "Kevin", rank: 1, victories: 10, defeats: 5, draws: 3, relations: null,
      ft_login: '',
      status: UserStatus.ONLINE,
      twoFA: '',
      channels: []
    };
    return connectedClient;
  }
}
