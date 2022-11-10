import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AuthController } from './auth.controller';
import { Oauth42Strategy } from './oauth42.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [HttpModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [Oauth42Strategy, SessionSerializer]
})
export class AuthModule {}
