import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { pseudoRandomBytes } from 'crypto';
import * as session from 'express-session';
import * as passport from 'passport';
import cors from "cors";
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  let origine = process.env.REACT_APP_WEBSITE_URL;
  origine = origine.slice(0, -1);
  app.enableCors({
    origin: origine,
    methods: ['POST', 'PUT', 'DELETE', 'GET', 'PATCH'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
  });
  app.use(session({
    secret: pseudoRandomBytes(128).toString('base64'),
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
         // Custom CSP and CORS go there
      }
    }
  }));
  const port = process.env.PORT;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  console.log("Website :" + origine);
}

bootstrap();
