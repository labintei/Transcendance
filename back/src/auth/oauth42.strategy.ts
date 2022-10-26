import { PassportStrategy } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-oauth2';
import { pseudoRandomBytes } from 'crypto';
import { lastValueFrom } from 'rxjs';

const clientID = process.env.API42_UID;
const clientSecret = process.env.API42_SECRET;
//const callbackURL = process.env.REACT_APP_WEBSITE_BASE_URL + "auth/";
const callbackURL = "http://" + process.env.REACT_APP_WEBSITE_HOSTNAME + ":3000/auth/";
const scope = "public";

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth42')
{
  constructor(
    private authService: AuthService,
		private http: HttpService
  ) {
		const state = pseudoRandomBytes(1024).toString('base64url');
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
    console.log("validate Call");
    const { data } = (await lastValueFrom(
			this.http.get(
        'https://api.intra.42.fr/v2/me',
        {
          headers: {
            Authorization: "Bearer " + accessToken
          },
    	  })
		));
    if (!data)
      throw new UnauthorizedException();
    let user = await this.authService.findUserFrom42Login(data.login);
    if (!user)
      user = await this.authService.createUserFrom42Login(data.login);
		return {...user, data42: data};
  }

}
