import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppDataSource } from './app.datasource';
import { AppModule } from './app.module';
import { User } from './entities/user.entity';

async function bootstrap() {
/*  await AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
  await AppDataSource.synchronize();
  const user = AppDataSource.manager.create(User, {
    username: 'newuser1',
    ft_login: 'jraffin'
  })
  await AppDataSource.synchronize();*/
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
}

bootstrap();
