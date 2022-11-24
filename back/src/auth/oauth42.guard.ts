import { ExecutionContext, Injectable } from '@nestjs/common';
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
    if (request.query.redirectURL !== undefined )
      request.session.redirectURL = request.query.redirectURL;
    request.query.redirectURL = request.session.redirectURL;
    let result;
    try {
      result = await super.canActivate(context) as boolean;
    }
    catch (e) {
      result = false;
    }
    if (result)
    {
      await super.logIn(request);
      const me = await User.findOneBy({ft_login: request.user});
      request.session.twoFASecret = me.twoFASecret;
      if (me.status === User.Status.BANNED)
        request.session.destroy();
    }
    else
      request.session.destroy();
    return true;
  }
}
