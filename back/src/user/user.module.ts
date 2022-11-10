import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FriendsController } from './friends.controller';
import { BlockedsController } from './blockeds.controller';
import { RankingController } from './ranking.controller';

@Module({
  controllers: [UserController, FriendsController, BlockedsController, RankingController]
})
export class UserModule {}
