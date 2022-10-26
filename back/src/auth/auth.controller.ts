import { Controller, Get, Req, Request, Session, UseGuards } from '@nestjs/common';
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
	async getUserFrom42Login(@Request() req): Promise<any> {
    console.log("profile route CALL");
		return req.user;
	}
}
