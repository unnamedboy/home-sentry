import { ConfigModule } from "@nestjs/config";
import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomeModule } from "./home/home.module";
// import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    AuthenticationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`./config/.${process.env.NODE_ENV}.env`, './config/development.env'],
    }),
    HealthModule,
    HomeModule,
    TypeOrmModule.forRoot({
      type: 'sqlite', // TODO: Use pgsql in the future
      database: 'database.sqlite',
      entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
      synchronize: true, // TODO: Disable in production and future development! Use migrations instead.
    }),
    // LogsModule,
  ],
})
export class AppModule {}