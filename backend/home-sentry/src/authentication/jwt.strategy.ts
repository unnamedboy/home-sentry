import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { IJwtPayload } from "./models/jwt-payload";
import { getJwtConfigOrThrow } from "src/utils/get-jwt-secret-or-throw";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
  const jwt = getJwtConfigOrThrow(configService);
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: jwt.secret,
    });
  }
  async validate(payload: IJwtPayload) {
    return { userId: payload.sub, username: payload.username };
  }
}
