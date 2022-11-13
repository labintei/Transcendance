import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchGateway } from './match.gateway';

@Module({
  providers: [MatchGateway],
  controllers: [MatchController]
})
export class MatchModule {}
