import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FriendsController } from './friends.controller';
import { BlockedsController } from './blockeds.controller';
import { RankingController } from './ranking.controller';
import { SearchController } from './search.controller';

@Module({
  controllers: [UserController, SearchController, FriendsController, BlockedsController, RankingController]
})
export class UserModule {}
