import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { Strategy } from 'passport-custom';
import { User } from 'src/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class FakeStrategy extends PassportStrategy(Strategy, 'fake')
{
  async validate(req: Request): Promise<any> {
    if (typeof req.query.login !== "string" || !req.query.login)
      throw new BadRequestException("Invalid <login> query parameter");
    let user = await User.findOneBy({ft_login: req.query.login as string});
    if (!user)
      throw new NotFoundException("User " + req.query.login + " was not found in database.");
    return user.ft_login;
  }
}
