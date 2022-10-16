import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Oauth42Strategy } from './oauth42.strategy';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthService, Oauth42Strategy]
})
export class AuthModule {}
