import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [TypeOrmModule.forFeature([User])]
})
export class ChatModule {}
