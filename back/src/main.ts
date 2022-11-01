import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { pseudoRandomBytes } from 'crypto';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  const port = process.env.PORT;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
}

bootstrap();
