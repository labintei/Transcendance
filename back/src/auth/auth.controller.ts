import { Controller, Get, Query, Request, Response, UseGuards } from '@nestjs/common';
import { oauth42Guard } from './oauth42.guard';

@Controller()
export class AuthController
{
	@Get('auth')
	@UseGuards(oauth42Guard)
	//@Redirect(process.env.REACT_APP_WEBSITE_URL + 'profile', 302)
	async loginWith42(@Query('redirectAfterLogin') redirURL, @Response() res) {
		if (res.status === 200)
			res.redirect(redirURL, 302);
	}

	@Get('logout')
	async logout(@Request() req): Promise<any> {
		req.session.destroy();
		return "You are now logged out.";
	}

}
