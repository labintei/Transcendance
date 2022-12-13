import { Controller, Get } from '@nestjs/common';
import { Channel } from './entities/channel.entity';

@Controller()
export class AppController
{

  @Get()
  getHello() {
    return "Hello World !";
  }

  @Get('test')
  async test(): Promise<any> {
    const list = await Channel.createQueryBuilder("channel")
      .leftJoinAndMapMany(
        "channel.users",
        "channel.users",
        "users",
        "users.channelId = channel.id")
      // MUST USE QUERY BUILDER

      // select: Channel.defaultFilter,
      // where: {
      //   status: Not(Channel.Status.DIRECT)
      // } as FindOptionsWhere<Channel>
    // });
    return list.getMany();
  }

}
