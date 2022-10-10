import {AppDataSource } from "./data-source";
import { User } from "./entity/user.entity";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata"

AppDataSource.initialize().then(async () => {

  await AppDataSource
  .createQueryBuilder()
  .insert()
  .into(User)
  .values([
      { firstName: "Timber", lastName: "Saw" ,age : 25},
      { firstName: "Phantom", lastName: "Lancer" , age : 26},
  ])
  .execute()

}).catch(error => console.log(error))

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();


/*
AppDataSource.initialize().then(async() => {
  const ex = new user()
  

})*/

/** fichier de demmarage */

