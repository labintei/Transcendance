import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    if (!context.switchToHttp().getRequest().isAuthenticated())
      throw new UnauthorizedException('Not logged in : you need to get 42 API authorization.')
    return true;
  }
}
