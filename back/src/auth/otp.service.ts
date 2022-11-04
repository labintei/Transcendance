import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { authenticator, totp } from "otplib";

@Injectable()
export class OTPService {

  public authenticator = authenticator;

  constructor(
    @InjectEntityManager()
    private manager: EntityManager
  ) {}

/*  async generateTotpUri(issuer: string, email: string, secret: string) {
    const otpauthUrl = authenticator.keyuri(user.email, 'AUTH_APP_NAME', secret);

    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.userId);

    return {
      secret,
      otpauthUrl
    }
  }*/
}
