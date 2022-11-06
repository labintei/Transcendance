import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from 'entities/user.entity';

@Controller("users")
export class UserController {
  constructor(private readonly appService: AppService) {}

  @Get()
  allUser() : User[] {
    let test:User[] = this.appService.getAll("");
    return test;
  }

  @Get('friends')
  getFriends(@Query('name') name:string): {friends:User[], others:User[]} {
    let fris:User[] = this.appService.getFriends(name);
    let oth:User[] = this.appService.getAll(name);
    oth = oth.filter(user => !fris.some(friend => friend.username == user.username));
    return {friends:fris, others:oth};
  }

  @Get('rank')
  aroundUser(@Query('name') name:string) : User[] {
    let test:User = this.appService.getUser();
    test.username = name;
    let list:User[] = this.appService.getAll("");
    if (test.rank < 10 && list.length > 10)
      list.splice(11, list.length - 10)
    for (let i:number = 0; i < list.length && list.length > 10; i++) {
      let rank = list[i].rank;
      let diff = rank - test.rank;
      if ((diff * diff > 9 && rank > 3) || rank < 1){
        list.splice(i, 1);
        --i;
      }
    }
    return list;
  }

  @Get('one')
  getUser(@Query('name') name:string ): User {
    let test:User = this.appService.getUser();
    test.username = name;
    console.log(name);
    return test;
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
