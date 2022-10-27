import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController
{
	constructor(
		private readonly authService: AuthService
	) {}

	@Get()
	@UseGuards(AuthGuard('oauth42'))
	async getUserFrom42Login(@Request() req): Promise<User> {
		return req.user;
	}
}
