// src/home/home.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('homes')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  findAll() {
    return this.homeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { name: string; timezone?: string | null },
  ) {
    return this.homeService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; timezone?: string | null },
  ) {
    return this.homeService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.remove(id);
  }
}
