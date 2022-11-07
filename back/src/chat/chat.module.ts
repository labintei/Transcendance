import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Message } from 'src/entities/message.entity';
import { Channel } from 'src/entities/channel.entity';
import { ChannelUser } from 'src/entities/channeluser.entity';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [TypeOrmModule.forFeature([User]),
            TypeOrmModule.forFeature([Message]),
            TypeOrmModule.forFeature([Channel]),
            TypeOrmModule.forFeature([ChannelUser]),
          ]
})
export class ChatModule {}
