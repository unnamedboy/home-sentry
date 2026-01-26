import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let configService: ConfigService;
  let jwtService: JwtService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ADMIN_USERNAME') return 'admin';
      if (key === 'ADMIN_PASSWORD') return 'password123';
      return null;
    }),
  };

  const mockJwtService = {
    sign: jest.fn((payload) => 'mock-token'),
    verifyAsync: jest.fn((token) => Promise.resolve({ iat: 1000, exp: 2000, sub: 'admin', username: 'admin' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loginAsync', () => {
    it('should return access token on valid credentials', async () => {
      const result = await service.loginAsync('admin', 'password123');

      expect(result).toBeDefined();
      expect(result!.accessToken).toBe('mock-token');
      expect(result!.issuedAt).toBe(1000);
      expect(result!.expiresIn).toBe(1000);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'admin', username: 'admin' });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('mock-token');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      await expect(service.loginAsync('wrong', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid username', async () => {
      await expect(service.loginAsync('wrong', 'password123')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      await expect(service.loginAsync('admin', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});
