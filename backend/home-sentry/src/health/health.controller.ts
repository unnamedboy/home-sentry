import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly appService: HealthService) {}

  @Get()
  getStatus(): { status: string; time: string } {
    return this.appService.getStatus();
  }
}
