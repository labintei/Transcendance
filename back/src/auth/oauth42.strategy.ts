import { PassportStrategy } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { lastValueFrom } from 'rxjs';
import { User } from 'src/entities/user.entity';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth42')
{
  constructor(
		private http: HttpService
  ) {
    super({
      authorizationURL  : "https://api.intra.42.fr/oauth/authorize",
      tokenURL          : "https://api.intra.42.fr/oauth/token",
      clientID          : process.env.API42_UID,
      clientSecret      : process.env.API42_SECRET,
      callbackURL       : process.env.REACT_APP_BACKEND_URL + "auth/42",
      scope             : "public",
      store             : true
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
    let user = await User.findByLogin(data.login);
    if (!user)
      user = await User.createFrom42Login(data.login, data.image_url);
    return data;
  }
}
