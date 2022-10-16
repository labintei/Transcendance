import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './entities/user.entity'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('user')
  newUser() : User {
    console.log("Ajout de User");
    let res;
    async () => {
      await this.appService.newUser().then(function (result) {res = result}).catch( function (error) {
        console.log("error")})
    }
    return res;
  }
 
  @Get('message')
  newMessage(): void {
    this.appService.NewMessage();
  }




}
