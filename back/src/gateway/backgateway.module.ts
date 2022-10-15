import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackGateway } from './app.gateway';

@Module({
    providers: [BackGateway]
})
export class BackGatewayModule {}