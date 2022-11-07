import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { pseudoRandomBytes } from 'crypto';
import * as session from 'express-session';
import * as passport from 'passport';
import { TransGuard } from './auth/trans.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.use(session({
    secret: pseudoRandomBytes(128).toString('base64'),
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
