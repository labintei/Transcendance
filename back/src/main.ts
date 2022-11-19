import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { pseudoRandomBytes } from 'crypto';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  let origine = process.env.REACT_APP_WEBSITE_URL;
  origine = origine.slice(0, -1).toLowerCase();
  app.enableCors({
    origin: origine,
    methods: ['POST', 'PUT', 'DELETE', 'GET', 'PATCH', 'OPTIONS'],
    credentials: true
  });
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
  console.log("Website : " + origine);
}

bootstrap();
