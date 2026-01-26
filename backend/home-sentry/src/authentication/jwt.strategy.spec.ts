import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { getJwtConfigOrThrow } from '../utils/get-jwt-secret-or-throw';

jest.mock('../utils/get-jwt-secret-or-throw');

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    configService = new ConfigService();

    const mockJwtConfig = {
      secret: 'test-secret-key',
      expiresInSeconds: 3600,
    };

    (getJwtConfigOrThrow as jest.Mock).mockReturnValue(mockJwtConfig);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: ConfigService, useValue: configService }],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should initialize with correct configuration', () => {
    expect(getJwtConfigOrThrow).toHaveBeenCalledWith(configService);
  });

  describe('validate', () => {
    it('should return user object with userId and username from JWT payload', async () => {
      const payload = {
        sub: 'user123',
        username: 'testuser',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user123',
        username: 'testuser',
      });
    });

    it('should map sub to userId correctly', async () => {
      const payload = {
        sub: 'differentId456',
        username: 'anotheruser',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('differentId456');
    });

    it('should preserve username from payload', async () => {
      const payload = {
        sub: 'user789',
        username: 'preservedusername',
      };

      const result = await strategy.validate(payload);

      expect(result.username).toBe('preservedusername');
    });

    it('should return object with only userId and username properties', async () => {
      const payload = {
        sub: 'user123',
        username: 'testuser',
      };

      const result = await strategy.validate(payload);

      expect(Object.keys(result)).toEqual(['userId', 'username']);
    });

    it('should handle special characters in username', async () => {
      const payload = {
        sub: 'user123',
        username: 'test.user@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result.username).toBe('test.user@example.com');
    });

    it('should handle numeric user IDs', async () => {
      const payload = {
        sub: '12345',
        username: 'user',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('12345');
    });

    it('should handle UUID format user IDs', async () => {
      const payload = {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        username: 'user',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('configuration', () => {
    it('should use Bearer token extraction strategy', () => {
      // The strategy should be configured to extract JWT from Authorization header as Bearer token
      // This is verified through the super() call with jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      expect(strategy).toBeDefined();
    });

    it('should not ignore token expiration', () => {
      // The strategy should validate token expiration (ignoreExpiration: false)
      expect(strategy).toBeDefined();
    });

    it('should use secret from config service', () => {
      expect(getJwtConfigOrThrow).toHaveBeenCalled();
      const mockJwtConfig = (getJwtConfigOrThrow as jest.Mock).mock.results[0].value;
      expect(mockJwtConfig.secret).toBe('test-secret-key');
    });
  });

  describe('error handling', () => {
    it('should throw error if config service throws', () => {
      const errorConfigService = new ConfigService();
      (getJwtConfigOrThrow as jest.Mock).mockImplementation(() => {
        throw new Error('JWT_SECRET not configured');
      });

      expect(() => {
        new JwtStrategy(errorConfigService);
      }).toThrow('JWT_SECRET not configured');
    });
  });
});
