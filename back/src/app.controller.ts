import { Controller, Get } from '@nestjs/common';
import { Channel } from './entities/channel.entity';

@Controller()
export class AppController
{

  @Get()
  getHello() {
    return "Hello World !";
  }

}
