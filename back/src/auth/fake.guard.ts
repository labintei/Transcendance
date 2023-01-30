import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FakeGuard extends AuthGuard('fake') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    await super.canActivate(context) as boolean;
    await super.logIn(request);
    return true;
  }
}
