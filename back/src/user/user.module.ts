import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FriendsController } from './friends.controller';
import { BlockedsController } from './blockeds.controller';
import { RankingController } from './ranking.controller';
import { SearchController } from './search.controller';
import { AvatarController } from './avatar.controller';

@Module({
  controllers: [
    UserController,
    SearchController,
    FriendsController,
    BlockedsController,
    RankingController,
    AvatarController
  ]
})
export class UserModule {}
