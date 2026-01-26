// src/home/room.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // GET /rooms?homeId=1
  @Get()
  findAll(@Query('homeId') homeId?: string) {
    if (homeId) {
      return this.roomService.findByHome(Number(homeId));
    }
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { homeId: number; name: string; floor?: string | null },
  ) {
    return this.roomService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; floor?: string | null },
  ) {
    return this.roomService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }
}
