import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authService: AuthenticationService;

  const mockAuthService = {
    loginAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        { provide: AuthenticationService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const mockToken = { accessToken: 'mock-token', issuedAt: 1000, expiresIn: 1000 };
      mockAuthService.loginAsync.mockResolvedValue(mockToken);

      const result = await controller.login('admin', 'password123');

      expect(result).toEqual(mockToken);
      expect(authService.loginAsync).toHaveBeenCalledWith('admin', 'password123');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockAuthService.loginAsync.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login('wrong', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should handle null response from service', async () => {
      mockAuthService.loginAsync.mockResolvedValue(null);

      await expect(controller.login('admin', 'password123')).rejects.toThrow(UnauthorizedException);
    });
  });
});
