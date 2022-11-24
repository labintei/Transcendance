import { Controller, ForbiddenException, Get, Request, Response, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Oauth42Guard } from './oauth42.guard';
import { authenticator } from 'otplib';
import { SessionGuard } from './session.guard';
import { TransGuard } from './trans.guard';

const loggedInMsg = "You are fully logged in.";

@Controller('auth')
export class AuthController
{

  constructor() {
    authenticator.options = { ...authenticator.options, window: [1, 1] };
  }

  /*
  **  This is a simple test route that gives you a different response code and
  **  message depending on your authentication level.
  **  Error 401  :  not logged in.
  **  Error 403  :  Authenticated (42 API) but not authorized because it needs a valid 2FA token.
  **  Status 200 :  You are fully logged in.
  **  The default guard class TransGuard can be used on any of the project routes implements these codes and messages.
  */
  @Get()
  @UseGuards(TransGuard)
  async authTest() {
    return loggedInMsg;
  }

  /*
  **  On these routes, you can use the "redirectURL" query parameter to
  **  specify an urlencoded callback URL to redirect to after authentication
  **  process ends. If you don't, it just gives you the status code and message.
  **
  **  You can also, for example, make an all-in-one authentication call by
  **  urlencoding each redirection and puting it in the redirectURL param
  **  of the previous call :
  **
  **  http://backend:3000/auth/42?redirectURL=2FA%3FtwoFAToken%3D000000%26redirectURL%3Dhttp%253A%252F%252Ffrontend%253A3080%252FProfile
  **
  */
  @Get('42')
  @UseGuards(Oauth42Guard)
  async loginWith42(@Request() req, @Response({ passthrough: true }) res) {
    const redir = req.query.redirectURL;
    if (redir !== undefined)
      res.redirect(redir);
    else if (req.session === undefined)
      throw new UnauthorizedException();
    else
      return loggedInMsg;
  }

  @Get('2FA')
  @UseGuards(SessionGuard)
  async validate2FA(@Request() req, @Response({ passthrough: true }) res) {
    if (!req.session.twoFASecret)
      return "2FA is either already validated or not activated on your profile."
    else {
      if (req.query.twoFAToken === undefined)
        throw new ForbiddenException('missing query parameter : <twoFAToken>');
      if (!authenticator.check(req.query.twoFAToken, req.session.twoFASecret))
        throw new ForbiddenException("2FA token is invalid.");
      req.session.twoFASecret = null;
    }
    const redir = req.query.redirectURL;
    if (redir !== undefined)
      res.redirect(redir);
    else
      return loggedInMsg;
  }

  @Get('logout')
  @UseGuards(SessionGuard)
  async logout(@Request() req, @Response({ passthrough: true }) res): Promise<any> {
    req.session.destroy();
    const redir = req.query.redirectURL;
    if (redir !== undefined)
      res.redirect(redir);
    else
      return "You are now logged out.";
  }

}
