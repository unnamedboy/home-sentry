// src/home/home.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeEntity } from './entities/home.entity';
import { RoomEntity } from './entities/room.entity';
import { DeviceEntity } from './entities/device.entity';
import { SignalEntity } from './entities/signal.entity';
import { SignalState } from './entities/signal-state.entity';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { AuditService } from './audit.service';
import { RoomController } from './room.controller';
import { DeviceController } from './device.controller';
import { RoomService } from './room.service';
import { DeviceService } from './device.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HomeEntity,
      RoomEntity,
      DeviceEntity,
      SignalEntity,
      SignalState,
    ]),
  ],
  providers: [AuditService, HomeService],
  controllers: [DeviceController, HomeController, RoomController],
  exports: [HomeService, RoomService, DeviceService, TypeOrmModule], // typeorm for future mqtt ingest modules
})
export class HomeModule {}
