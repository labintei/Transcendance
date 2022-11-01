import { Controller, Get, Redirect, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from './authenticated.guard';
import { oauth42Guard } from './oauth42.guard';

@Controller()
export class AuthController
{
	@Get('auth')
	@UseGuards(oauth42Guard)
	@Redirect(process.env.REACT_APP_BACKEND_URL + 'user')
	//@Redirect(process.env.REACT_APP_WEBSITE_URL + 'profile')
	async loginWith42() {}

	@Get('logout')
	async logout(@Request() req): Promise<any> {
		req.session.destroy();
		return "You are now logged out.";
	}

}
