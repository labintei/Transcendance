import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class oauth42Guard extends AuthGuard('oauth42') {

  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions<any> {
    return {
      ...super.getAuthenticateOptions(context),
      state: { code2FA: parseInt(context.switchToHttp().getRequest().query.code2FA) }
    };
  }

  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(context.switchToHttp().getRequest());
    return result
  }
}
