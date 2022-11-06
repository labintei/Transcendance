import { Controller, ForbiddenException, Get, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { oauth42Guard } from './oauth42.guard';
import { authenticator } from "@otplib/preset-default-async";

@Controller()
export class AuthController
{

	constructor() {
		authenticator.options = { ...authenticator.options, window: [1, 1]} ;
	}

	@Get('auth')
	@UseGuards(oauth42Guard)
	async loginWith42(@Request() req) {
		if (req.user.twoFA
			&& (!req.authInfo.state.twoFAToken
				|| !await authenticator.check(req.authInfo.state.twoFAToken, req.user.twoFA)))
		{
			req.session.destroy();
			throw new ForbiddenException("2FA token is invalid or missing.");
		}
		return "You are now logged in.";
	}

	@Get('logout')
	async logout(@Request() req): Promise<any> {
		req.session.destroy();
		return "You are now logged out.";
	}



}
