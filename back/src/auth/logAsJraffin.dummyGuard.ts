import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LogAsJraffin extends AuthGuard('oauth42') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = 'jraffin';
    await super.logIn(request);
    return true;
  }
}
