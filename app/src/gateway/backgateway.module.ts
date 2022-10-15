import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FrontGateway } from './app.gateway';

@Module({
    providers: [FrontGateway]
})
export class FrontGatewayModule {}