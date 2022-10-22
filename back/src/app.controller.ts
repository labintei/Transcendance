import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from 'entities/user.entity';

@Controller("users")
export class UserController {
  constructor(private readonly appService: AppService) {}

  @Get()
  allUser() : User[] {
    let test:User[] = Array(1);
    test[0] = this.appService.getUser();
    return test;
  }

  @Get('friends')
  getFriends(@Query('name') name:string): {friends:User[], others:User[]} {
    let fris:User[] = this.appService.getFriends(name);
    let oth:User[] = this.appService.getAllNotFriends(name);
    return {friends:fris, others:oth};
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
