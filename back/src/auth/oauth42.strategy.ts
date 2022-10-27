import { PassportStrategy } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-oauth2';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth42')
{
  constructor(
		private http: HttpService,
    private authService: AuthService
  ) {
    super({
      authorizationURL: "https://api.intra.42.fr/oauth/authorize",
      tokenURL        : "https://api.intra.42.fr/oauth/token",
      clientID        : process.env.API42_UID,
      clientSecret    : process.env.API42_SECRET,
      //callbackURL     : process.env.REACT_APP_WEBSITE_BASE_URL + "auth/",
      callbackURL     : "http://" + process.env.REACT_APP_WEBSITE_HOSTNAME + ":3000/auth/",
      scope           : "public",
      state           : true // Value doesn't matter, just defining it enables the state to be generated at each request.
    });
  }

  async validate(accessToken: string): Promise<any> {
    const { data } = (await lastValueFrom(
			this.http.get(
        'https://api.intra.42.fr/v2/me',
        {
          headers: {
            Authorization: "Bearer " + accessToken
          },
    	  })
		));
    const user = await this.authService.findUserFrom42Login(data.login);
		return { ...user, data42: data };
  }

}
