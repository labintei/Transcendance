import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';

@Injectable()
export class Oauth42Guard extends AuthGuard('oauth42') {

  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions<any> {
    return {
      ...super.getAuthenticateOptions(context),
      state: { redirectURL: context.switchToHttp().getRequest().query.redirectURL }
    };
  }

  async canActivate(context: ExecutionContext) {
    let result;
    try {
      result = await super.canActivate(context) as boolean;
    }
    catch {
      result = false;
    }
    finally {
      const request = context.switchToHttp().getRequest();
      if (result)
      {
        await super.logIn(request);
        const me = await User.findByLogin(request.user.login);
        request.session.twoFASecret = me.twoFASecret;
      }
      else
        request.session.destroy();
      return true;
    }
  }
}
