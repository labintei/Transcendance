import { Controller, Get, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { oauth42Guard } from './oauth42.guard';
import { totp } from "otplib";

@Controller()
export class AuthController
{
	@Get('auth')
	@UseGuards(oauth42Guard)
	async loginWith42(@Request() req) {

/*		if (req.user.twoFA && req.authInfo.state.code2FA !== req.user.twoFA)
			throw new UnauthorizedException();*/
		return "You are now logged in.";
	}

	@Get('logout')
	async logout(@Request() req): Promise<any> {
		req.session.destroy();
		return "You are now logged out.";
	}

}
