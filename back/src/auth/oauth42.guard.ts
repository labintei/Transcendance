import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';

@Injectable()
export class Oauth42Guard extends AuthGuard('oauth42') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    //  Here we save the redirectURL query parameter into the session
    //  and we put it back if it exists to be still able to use it after
    //  several redirected requests.
    //  In case of authentication failure the session is destroyed anyway.
    if (request.query.redirectURL !== undefined && request.session)
      request.session.redirectURL = request.query.redirectURL;
    request.query.redirectURL = request.session?.redirectURL;
    let result = false;
    try {
      result = await super.canActivate(context) as boolean;
    }
    catch {
      result = false;
    }
    if (result)
      await super.logIn(request);
    else
      request.session.destroy();
    return true;
  }
}
