
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getDataSourceName } from '@nestjs/typeorm';
import { AppService } from './app.service';


async function bootstrap() {


  const app = await NestFactory.create(AppModule, {cors:true});
  await app.listen(3000);

}
bootstrap();
