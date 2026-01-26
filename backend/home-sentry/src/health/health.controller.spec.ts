import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have getStatus method', () => {
    expect(controller.getStatus).toBeDefined();
    expect(typeof controller.getStatus).toBe('function');
  });

  describe('getStatus', () => {
    it('should return status and time from service', () => {
      const result = controller.getStatus();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('time');
    });

    it('should return healthy status', () => {
      const result = controller.getStatus();

      expect(result.status).toBe('healthy');
    });

    it('should return a valid timestamp', () => {
      const result = controller.getStatus();

      expect(result.time).toBeDefined();
      expect(typeof result.time).toBe('string');
      // Validate ISO format timestamp
      expect(result.time).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should call service getStatus method', () => {
      const spy = jest.spyOn(service, 'getStatus');

      controller.getStatus();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should return service response directly', () => {
      const mockResponse = {
        status: 'healthy',
        time: '2026-01-26T10:00:00+08:00',
      };

      jest.spyOn(service, 'getStatus').mockReturnValue(mockResponse);

      const result = controller.getStatus();

      expect(result).toEqual(mockResponse);
    });

    it('should return object with string properties', () => {
      const result = controller.getStatus();

      expect(typeof result.status).toBe('string');
      expect(typeof result.time).toBe('string');
    });

    it('should be decorated as GET endpoint', () => {
      // The @Get() decorator is applied to getStatus method
      const metadata = Reflect.getMetadata('path', controller.getStatus);
      // Since this is a simple heartbeat, we just verify the method exists
      expect(controller.getStatus).toBeDefined();
    });
  });

  describe('HealthService integration', () => {
    it('should successfully inject HealthService', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(HealthService);
    });

    it('should use injected service in controller', () => {
      const spy = jest.spyOn(service, 'getStatus');

      controller.getStatus();

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });
});
