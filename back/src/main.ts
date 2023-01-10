import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { pseudoRandomBytes } from 'crypto';
import { Server, ServerOptions } from "socket.io";
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Request } from 'express';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';

const session_cookie_name = 'trans-cookie';
const sessionSecret = pseudoRandomBytes(64).toString('base64');
const sessionStore = new expressSession.MemoryStore();
const corsOptions = {
  origin: 'http://' + process.env.REACT_APP_HOSTNAME.toLowerCase() + (process.env.REACT_APP_WEBSITE_PORT=='80'?'':':' + process.env.REACT_APP_WEBSITE_PORT),
  credentials: true
};

class SessionIOAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const io: Server = super.createIOServer(port, {cors: corsOptions, ...options});
    io.use((socket, next) => {
      const req = socket.request as Request;

      //  ********** FOR DEVELOPMENT ONLY **********
      //  Uncomment this to ignore the session cookie and automatically log in the websockets as an existing user.
      // req.user = 'jraffin'; return next();

      let sessionID;
      if (req.headers.cookie) {
        const cookies = cookie.parse(req.headers.cookie);
        sessionID = cookieParser.signedCookie(cookies[session_cookie_name], sessionSecret);
      }
      sessionStore.get(sessionID, (err, session: any) => {
        if (err)
          return next(err);
        if (!session?.passport?.user)
          return next(new Error('Not logged in : you need to get 42 API authorization.'));
        req.user = session.passport.user;
        if (session.twoFASecret)
        return next(new Error('Partially logged in : you need to validate a 2FA token.'));
        return next();
      });
    });
    return io;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsOptions);
  app.useWebSocketAdapter(new SessionIOAdapter(app));
  app.use(expressSession({
    store: sessionStore,
    name: session_cookie_name,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  const port = process.env.PORT;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  console.log("Backend : " + process.env.REACT_APP_BACKEND_URL.toLowerCase());
  console.log("Website : " + process.env.REACT_APP_WEBSITE_URL.toLowerCase());
}

bootstrap();
