import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import { SessionGuard } from "./session.guard";

@Injectable()
export class TransGuard extends SessionGuard {
  async canActivate(context: ExecutionContext) {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest()
    if (request.session.twoFASecret)
      throw new ForbiddenException('Partially logged in : you need to validate a 2FA token.')
    return true;
  }
}
