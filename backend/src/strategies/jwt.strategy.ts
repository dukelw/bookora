/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/modules/auth/interfaces/JwtPayload';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // This send user for the other request
  async validate(payload: JwtPayload) {
    const foundUser = await this.authService.findByEmail(payload.email);

    if (!foundUser) {
      throw new UnauthorizedException('User not found or unauthorized');
    }

    return foundUser;
  }
}
