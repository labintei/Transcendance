import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FriendController } from './friends.controller';
import { BlockedController } from './blockeds.controller';

@Module({
  providers: [UserService],
  controllers: [UserController, FriendController, BlockedController]
})
export class UserModule {}
