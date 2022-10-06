import { NestFactory } from '@nestjs/core';
import { AppDataSource } from './app.datasource';
import { AppModule } from './app.module';
import { User } from './model/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
  await AppDataSource.synchronize();
//  await AppDataSource.manager.create(new User())
  const port = process.env.PORT;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
}

bootstrap();
