import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IAccessToken } from './models/access-token';

@Injectable()
export class AuthenticationService {

  private readonly adminUsername: string;
  private readonly adminPassword: string;

  constructor(private readonly configService: ConfigService, private readonly jwtService: JwtService) {
    this.adminUsername = this.configService.get<string>('ADMIN_USERNAME') || 'admin';
    this.adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'password123';

  }

    
  async loginAsync (username: string, password: string): Promise<IAccessToken | null> {
    if (username !== this.adminUsername || password !== this.adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // TODO: update subject in the future, when we have db connected
    const payload = { sub: username, username: username };
    const access_token = this.jwtService.sign(payload);

    const decoded = await this.jwtService.verifyAsync(access_token);

    return { 
      accessToken: access_token, 
      issuedAt: decoded.iat,
      expiresIn: decoded.exp - decoded.iat
    };    
  }
}
