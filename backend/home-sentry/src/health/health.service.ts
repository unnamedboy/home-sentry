import { Injectable } from '@nestjs/common';
import moment from 'moment';

@Injectable()
export class HealthService {
  getStatus(): { status: string; time: string } {
    return { status: 'healthy', time: moment().format()};
  }
}
