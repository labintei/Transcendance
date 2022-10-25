import { Controller, Get, Req, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController
{

	constructor(
		private authService: AuthService
	) {}

	@Get()
	@UseGuards(AuthGuard('oauth42'))
	async getUserFrom42Login(@Req() request : Request, @Session() session: Record<string, any>): Promise<any> {
		return request.session.login;
		//this.authService.findUserFrom42Login(request.session.visits);
	}
}
