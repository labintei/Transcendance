import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { User } from './entities/user.entity';
import { Match } from './entities/match.entity';
import { Message } from './entities/message.entity';
import { UserRelationship } from './entities/userrelationship.entity';
import { ChannelUser } from './entities/channeluser.entity';
import { UserSocket } from './entities/usersocket.entity';
import { Channel } from './entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      entities: [
        User,
        UserRelationship,
        UserSocket,
        Match,
        Message,
        Channel,
        ChannelUser,
        //'dist/**/*.entity{.ts,.js}'
      ],
      retryDelay: 5000,
      retryAttempts: 0,
      synchronize: true
    }),
    AuthModule,
    ChatModule,
    UserModule,
    SocketModule,
    GameModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
