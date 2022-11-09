import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FriendsController } from './friends.controller';
import { BlockedsController } from './blockeds.controller';

@Module({
  providers: [UserService],
  controllers: [UserController, FriendsController, BlockedsController]
})
export class UserModule {}
