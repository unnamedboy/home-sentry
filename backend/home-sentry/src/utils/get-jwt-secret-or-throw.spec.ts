import { ConfigService } from '@nestjs/config';
import { getJwtConfigOrThrow } from './get-jwt-secret-or-throw';

describe('getJwtConfigOrThrow', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should return JWT config with valid secret and default expiry', () => {
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret-key';
      }
      if (key === 'TOKEN_EXPIRY_SECONDS') {
        return '3600';
      }
      throw new Error(`Unknown config key: ${key}`);
    });

    const result = getJwtConfigOrThrow(configService);

    expect(result).toEqual({
      secret: 'test-secret-key',
      expiresInSeconds: 3600,
    });
  });

  it('should return JWT config with custom expiry seconds', () => {
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'my-secret';
      }
      if (key === 'TOKEN_EXPIRY_SECONDS') {
        return '7200';
      }
      throw new Error(`Unknown config key: ${key}`);
    });

    const result = getJwtConfigOrThrow(configService);

    expect(result).toEqual({
      secret: 'my-secret',
      expiresInSeconds: 7200,
    });
  });

  it('should use default expiry when TOKEN_EXPIRY_SECONDS is not provided', () => {
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string, defaultValue?: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret';
      }
      if (key === 'TOKEN_EXPIRY_SECONDS') {
        return defaultValue || '3600';
      }
      throw new Error(`Unknown config key: ${key}`);
    });

    const result = getJwtConfigOrThrow(configService);

    expect(result.expiresInSeconds).toBe(3600);
  });

  it('should throw error when JWT_SECRET is not provided', () => {
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        throw new Error('JWT_SECRET is not defined');
      }
      return '3600';
    });

    expect(() => {
      getJwtConfigOrThrow(configService);
    }).toThrow('JWT_SECRET is not defined');
  });

  it('should correctly parse expiry seconds as integer', () => {
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'secret';
      }
      if (key === 'TOKEN_EXPIRY_SECONDS') {
        return '1800';
      }
      throw new Error(`Unknown config key: ${key}`);
    });

    const result = getJwtConfigOrThrow(configService);

    expect(result.expiresInSeconds).toBe(1800);
    expect(typeof result.expiresInSeconds).toBe('number');
  });

  it('should handle large expiry values', () => {
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'secret';
      }
      if (key === 'TOKEN_EXPIRY_SECONDS') {
        return '31536000'; // 1 year in seconds
      }
      throw new Error(`Unknown config key: ${key}`);
    });

    const result = getJwtConfigOrThrow(configService);

    expect(result.expiresInSeconds).toBe(31536000);
  });
});
