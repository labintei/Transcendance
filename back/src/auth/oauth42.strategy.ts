import { PassportStrategy } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-oauth2';
import { pseudoRandomBytes } from 'crypto';
import { firstValueFrom } from 'rxjs';

const clientID = process.env.API42_UID;
const clientSecret = process.env.API42_SECRET;
//const callbackURL = process.env.REACT_APP_WEBSITE_BASE_URL + "auth/";
const callbackURL = "http://" + process.env.REACT_APP_HOSTNAME + ":3000/auth/";
const scope = "public";

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth42')
{
  constructor(
    private authService: AuthService,
		private http: HttpService
  ) {
		const state = pseudoRandomBytes(128).toString('base64url');
    const authparams = new URLSearchParams({
      client_id     : clientID,
      redirect_uri  : callbackURL,
      response_type : 'code',
      scope,
      state
    });
    super({
      authorizationURL	: "https://api.intra.42.fr/oauth/authorize?" + authparams.toString(),
      tokenURL					: "https://api.intra.42.fr/oauth/token",
      clientID,
      clientSecret,
      callbackURL,
      scope,
      state
    });
  }

  async validate(accessToken: string): Promise<any> {
    const { data } = await firstValueFrom(
			this.http.get('https://api.intra.42.fr/v2/me', {
				headers: {
					Authorization: "Bearer " + accessToken
				},
    	})
		);
		return this.authService.findUserFrom42Login(data.login);
  }

}
