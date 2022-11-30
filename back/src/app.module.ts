import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
// import { MatchModule } from './match/match.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      entities: ['dist/**/*.entity{.ts,.js}'],
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
