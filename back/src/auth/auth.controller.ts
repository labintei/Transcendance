import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { oauth42Guard } from './oauth42.guard';

@Controller()
export class AuthController
{
	@Get('auth')
	@UseGuards(oauth42Guard)
	async loginWith42() {
		return "You are now logged in.";
	}

	@Get('logout')
	async logout(@Request() req): Promise<any> {
		req.session.destroy();
		return "You are now logged out.";
	}

}
