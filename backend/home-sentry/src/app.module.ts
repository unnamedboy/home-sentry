import { ConfigModule } from "@nestjs/config";
import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { AuthenticationModule } from './authentication/authentication.module';
// import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`./config/.${process.env.NODE_ENV}.env`, './config/development.env'],
    }),
    HealthModule,
    AuthenticationModule,
    // LogsModule,
  ],
})
export class AppModule {}