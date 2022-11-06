import { Controller, ForbiddenException, Get, Request, Response, UseGuards } from '@nestjs/common';
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

	@Get('auth-test')
	@UseGuards(TransGuard)
	async authTest() {
		return "You are fully logged in.";
	}

	/*	On this route, you can use the "frontendCallbackURL" query parameter to
	**	specify an urlencoded callback URL to redirect to after authentication
	**	process ends.
	*/
	@Get('auth')
	@UseGuards(Oauth42Guard)
	async loginWith42(@Request() req, @Response({ passthrough: true }) res) {
		const redir = req.authInfo.state.frontendCallbackURL;
		console.log(redir);
		if (redir)
		{
			res.redirect(302, redir);
			return;
		}
		return this.authTest();
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
