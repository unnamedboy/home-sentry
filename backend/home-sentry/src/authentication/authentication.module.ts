import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getJwtConfigOrThrow } from 'src/utils/get-jwt-secret-or-throw';

@Module({
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwt = getJwtConfigOrThrow(configService);
        return {
          secret: jwt.secret,
          signOptions: { expiresIn: jwt.expiresInSeconds },
        };
      }
    }),
  ],
})
export class AuthenticationModule {
}
