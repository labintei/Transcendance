import { Controller, ForbiddenException, Get, Request, Response, UseGuards } from '@nestjs/common';
import { Oauth42Guard } from './oauth42.guard';
import { authenticator } from 'otplib';
import { SessionGuard } from './session.guard';
import { TransGuard } from './trans.guard';

@Controller('auth')
export class AuthController
{

	constructor() {
		authenticator.options = { ...authenticator.options, window: [1, 1] };
	}

	/*
	**	This is a simple test route that gives you a different response code and
	**	message depending on your authentication level.
	**	Error 401  :  not logged in.
	**	Error 403  :  Authenticated (42 API) but not authorized because it needs a valid 2FA token.
	**	Status 200 :  You are fully logged in.
	**	The default guard class TransGuard can be used on any of the project routes implements these codes and messages.
	*/
	@Get()
	@UseGuards(TransGuard)
	async authTest() {
		return "You are fully logged in.";
	}

	/*
	**	On these routes, you can use the "redirectURL" query parameter to
	**	specify an urlencoded callback URL to redirect to after authentication
	**	process ends. If you don't, it redirects to the test route /auth.
	**
	**	You can also, for example, make an all-in-one authentication call by
	**	urlencoding each redirection and puting it in the redirectURL param
	**	of the previous call :
	**
	**	http://backend:3000/auth/42?redirectURL=2FA%3FtwoFAToken%3D000000%26redirectURL%3Dhttp%253A%252F%252Ffrontend%253A3080%252FProfile
	**
	*/

	@Get('42')
	@UseGuards(Oauth42Guard)
	async loginWith42(@Request() req, @Response() res) {
		if (!req.authInfo.state)
			res.redirect(process.env.REACT_APP_WEBSITE_URL);	//redirectURL not accessible in case of 42API refusal.
		const redir = req.authInfo.state.redirectURL;
		if (redir)
			res.redirect(redir);
		else
			res.redirect('/auth');
	}

	@Get('2FA')
	@UseGuards(SessionGuard)
	async validate2FA(@Request() req, @Response() res) {
		if (!req.user.twoFASecret)
			return "2FA is not activated on your profile, no need for a 2FA token."
		if (!req.query.twoFAToken)
			throw new ForbiddenException('missing query parameter : "twoFAToken"');
		if (!authenticator.check(req.query.twoFAToken, req.user.twoFASecret))
			throw new ForbiddenException("2FA token is invalid.");
		req.session.is2FAOK = true;
		const redir = req.query.redirectURL;
		if (redir)
			res.redirect(redir);
		else
			res.redirect('/auth');
	}

	@Get('logout')
	async logout(@Request() req, @Response() res): Promise<any> {
		req.session.destroy();
		const redir = req.query.redirectURL;
		if (redir)
			res.redirect(redir);
		else
			res.redirect('/auth');
	}

}
