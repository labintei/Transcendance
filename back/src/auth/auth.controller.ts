import { Controller, ForbiddenException, Get, Request, UseGuards } from '@nestjs/common';
import { Oauth42Guard } from './oauth42.guard';
import { authenticator } from "@otplib/preset-default-async";
import { SessionGuard } from './session.guard';
import { TransGuard } from './trans.guard';

@Controller()
export class AuthController
{

	constructor() {
		authenticator.options = { ...authenticator.options, window: [1, 1] };
	}

	@Get('auth')
	@UseGuards(TransGuard)
	@UseGuards(Oauth42Guard)
	async loginWith42(@Request() req) {

		return "You are now logged in, no need for a 2FA token.";
	}

	@Get('2FA')
	@UseGuards(SessionGuard)
	async validate2FA(@Request() req) {
		if (!req.user.twoFASecret)
			return "2FA is not activated on your profile, no need for a 2FA token."
		if (!req.query.twoFAToken)
			throw new ForbiddenException('missing query parameter : "twoFAToken"');
		if (!await authenticator.check(req.query.twoFAToken, req.user.twoFASecret))
			throw new ForbiddenException("2FA token is invalid.");
		req.session.is2FAOK = true;
		return "2FA token has been validated, you are now logged in.";
	}

	@Get('logout')
	async logout(@Request() req): Promise<any> {
		req.session.destroy();
		return "You are now logged out.";
	}
}
