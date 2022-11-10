import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { UserService } from 'src/user/user.service';
import { MatchGateway } from './match.gateway';

@Module({
  providers: [MatchService, UserService, MatchGateway],
  controllers: [MatchController]
})
export class MatchModule {}
