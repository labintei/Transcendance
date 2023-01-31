import { Global, Module } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  providers: [SocketGateway, SchedulerRegistry],
  exports: [SocketGateway]
})
export class SocketModule {}
