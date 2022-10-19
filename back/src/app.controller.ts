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
  newUser() :User {
    // cette facon marche
    console.log("Insertion");
    let res;
    this.appService.newUser().then( function (result) {res = result}).catch(function (error) {console.log("error")});
    return res;
  }
 /* 
  @Get('user')
  newUser() {
    console.log("Ajout de User");
    async () => {   
     try {
        let res = await this.appService.newUser();
       return res;
      }
      catch (error)
      {
       console.log("error");
       return null;
      }
    }
  //  async () => {
  //    res = await this.appService.newUser();
   //   return res;
   // }
    async () => {
      await this.appService.newUser().then(function (result) {res = result}).catch( function (error) {
        console.log("error")})
    }
  }*/
 
  @Get('message')
  newMessage(): void {
    this.appService.NewMessage();
  }




}
