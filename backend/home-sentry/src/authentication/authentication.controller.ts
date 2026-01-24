import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { IAccessToken } from './models/access-token';

@Controller('auth')
export class AuthenticationController {

    constructor(private readonly authService: AuthenticationService) {}

    @Post('login')
    async login(@Body('username')username: string, 
        @Body('password')password: string): Promise<IAccessToken> {
        const token = await this.authService.loginAsync(username, password);

        if (token === null) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return token;
    }

}
