import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('new')
  newUser() {
    return this.appService.newUser();
  }

  @Get('users')
  getUsers() {
    return this.appService.getUsers();
  }

  @Get('details')
  getDetails() {
    return this.appService.getDetails();
  }
}
