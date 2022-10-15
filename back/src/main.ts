
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getDataSourceName } from '@nestjs/typeorm';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
