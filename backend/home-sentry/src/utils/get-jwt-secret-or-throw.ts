// jwt.config.ts
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/authentication/models/jwt-config';

export const getJwtConfigOrThrow = (config: ConfigService): IJwtConfig => ({
  secret: config.getOrThrow<string>('JWT_SECRET'),
  expiresInSeconds: parseInt(config.getOrThrow<string>('TOKEN_EXPIRY_SECONDS', '3600')),
});