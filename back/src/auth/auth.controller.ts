import { Controller, Get, Req, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController
{

	constructor(
		private authService: AuthService
	) {}

	@Get()
	@UseGuards(AuthGuard('oauth42'))
	async getUserFrom42Login(@Session() session: Record<string, any>): Promise<any> {
		return this.authService.findUserFrom42Login(session.login);
	}
}
