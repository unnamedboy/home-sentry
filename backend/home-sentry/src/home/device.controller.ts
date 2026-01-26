// src/home/device.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // GET /devices?roomId=1
  @Get()
  findAll(@Query('roomId') roomId?: string) {
    if (roomId) {
      return this.deviceService.findByRoom(Number(roomId));
    }
    return this.deviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deviceService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      roomId?: number | null;
      name: string;
      kind: string;
      source?: string;
      sourceRef?: string | null;
    },
  ) {
    return this.deviceService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      roomId?: number | null;
      name?: string;
      kind?: string;
      source?: string;
      sourceRef?: string | null;
    },
  ) {
    return this.deviceService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deviceService.remove(id);
  }
}
