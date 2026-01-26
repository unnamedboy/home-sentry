import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = app.get<HealthController>(HealthController);
    service = app.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return health status', () => {
      const result = controller.getStatus();
      
      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(result.time).toBeDefined();
      expect(typeof result.time).toBe('string');
    });

    it('should return the status from service', () => {
      const result = controller.getStatus();
      const serviceResult = service.getStatus();

      expect(result).toEqual(serviceResult);
    });
  });
});
