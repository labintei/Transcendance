import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { User } from "src/entities/user.entity";

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.isAuthenticated())
      throw new UnauthorizedException('Not logged in : you need to get 42 API authorization.')
    const user = await User.findOneBy({ ft_login: request.user });
    if (user.status === User.Status.BANNED) {
      request.session.destroy();
      throw new UnauthorizedException("Sorry, you have been banned from this server...");
    }
    return true;
  }
}
