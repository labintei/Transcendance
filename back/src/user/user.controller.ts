import { Controller, Delete, Get, NotFoundException, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';

@Controller('user')
@UseGuards(TransGuard)
export class UserController
{

  @Get()
  async getMe(@Request() req): Promise<User> {
    const user = await User.findByLogin(req.user.login);
    return user;
  }

  @Patch()
  async updateMe(@Request() req): Promise<User> {
    const updated = await User.update(req.user.login, req.body)
    req.user = { ...req.user, ...updated };
    return req.user;
  }

  @Get(':username')
  async getUserAndRelationship(@Request() req, @Param('username') username): Promise<any> {
    const user = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    const relationship = await user.getRelationship(related);
    return { relationship: relationship, ...related };
  }

  @Delete(':username')
  async delRelationship(@Request() req, @Param('username') username) {
    const user = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    user.delRelationship(related);
  }

}
