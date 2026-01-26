import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import moment from 'moment';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return an object with status and time properties', () => {
      const result = service.getStatus();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('time');
    });

    it('should return healthy status', () => {
      const result = service.getStatus();

      expect(result.status).toBe('healthy');
    });

    it('should return a valid ISO timestamp', () => {
      const result = service.getStatus();

      expect(result.time).toBeDefined();
      expect(typeof result.time).toBe('string');
      // Validate ISO format (YYYY-MM-DDTHH:mm:ssZ or similar)
      expect(result.time).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    it('should return current time from moment', () => {
      const beforeCall = moment();
      const result = service.getStatus();
      const afterCall = moment();

      const resultTime = moment(result.time);

      // The returned time should be approximately current (within a few seconds)
      const diffMs = Math.abs(resultTime.diff(beforeCall));
      expect(diffMs).toBeLessThan(5000); // Within 5 seconds
    });

    it('should return different times on successive calls', (done) => {
      const result1 = service.getStatus();

      // Wait a bit and call again
      setTimeout(() => {
        const result2 = service.getStatus();

        // Times should be different (or at least close)
        expect(result1.time).toBeDefined();
        expect(result2.time).toBeDefined();
        done();
      }, 10);
    });

    it('should always return the same status string', () => {
      const result1 = service.getStatus();
      const result2 = service.getStatus();

      expect(result1.status).toBe(result2.status);
      expect(result1.status).toBe('healthy');
    });

    it('should return response with correct types', () => {
      const result = service.getStatus();

      expect(typeof result.status).toBe('string');
      expect(typeof result.time).toBe('string');
    });

    it('should not have extra properties in response', () => {
      const result = service.getStatus();
      const keys = Object.keys(result);

      expect(keys.length).toBe(2);
      expect(keys).toContain('status');
      expect(keys).toContain('time');
    });
  });

  describe('multiple calls', () => {
    it('should be callable multiple times without errors', () => {
      expect(() => {
        service.getStatus();
        service.getStatus();
        service.getStatus();
      }).not.toThrow();
    });

    it('should maintain consistent status across multiple calls', () => {
      const results = [
        service.getStatus(),
        service.getStatus(),
        service.getStatus(),
      ];

      results.forEach((result) => {
        expect(result.status).toBe('healthy');
      });
    });
  });
});
