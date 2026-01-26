import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLogEntity } from './entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: Repository<AuditLogEntity>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLogEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<Repository<AuditLogEntity>>(
      getRepositoryToken(AuditLogEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create and save an audit log for INSERT action', async () => {
      const params = {
        tableName: 'devices',
        action: 'INSERT' as const,
        recordId: '123',
        userId: 'user-1',
        newValue: { name: 'Device 1', type: 'light' },
      };

      const mockAuditLog = {
        id: '1',
        tableName: 'devices',
        action: 'INSERT',
        recordId: '123',
        timestamp: new Date(),
        userId: 'user-1',
        oldValue: null,
        newValue: JSON.stringify({ name: 'Device 1', type: 'light' }),
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(params);

      expect(mockRepository.create).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'INSERT',
        recordId: '123',
        timestamp: expect.any(Date),
        userId: 'user-1',
        oldValue: null,
        newValue: JSON.stringify({ name: 'Device 1', type: 'light' }),
      });

      expect(mockRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should create and save an audit log for UPDATE action', async () => {
      const params = {
        tableName: 'devices',
        action: 'UPDATE' as const,
        recordId: 123,
        userId: 'user-2',
        oldValue: { name: 'Device 1' },
        newValue: { name: 'Device 2' },
      };

      const mockAuditLog = {
        id: '2',
        tableName: 'devices',
        action: 'UPDATE',
        recordId: '123',
        timestamp: new Date(),
        userId: 'user-2',
        oldValue: JSON.stringify({ name: 'Device 1' }),
        newValue: JSON.stringify({ name: 'Device 2' }),
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(params);

      expect(mockRepository.create).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'UPDATE',
        recordId: '123',
        timestamp: expect.any(Date),
        userId: 'user-2',
        oldValue: JSON.stringify({ name: 'Device 1' }),
        newValue: JSON.stringify({ name: 'Device 2' }),
      });

      expect(mockRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should create and save an audit log for DELETE action', async () => {
      const params = {
        tableName: 'devices',
        action: 'DELETE' as const,
        recordId: '456',
        userId: 'user-3',
        oldValue: { name: 'Device 3', status: 'active' },
      };

      const mockAuditLog = {
        id: '3',
        tableName: 'devices',
        action: 'DELETE',
        recordId: '456',
        timestamp: new Date(),
        userId: 'user-3',
        oldValue: JSON.stringify({ name: 'Device 3', status: 'active' }),
        newValue: null,
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(params);

      expect(mockRepository.create).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'DELETE',
        recordId: '456',
        timestamp: expect.any(Date),
        userId: 'user-3',
        oldValue: JSON.stringify({ name: 'Device 3', status: 'active' }),
        newValue: null,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle null userId', async () => {
      const params = {
        tableName: 'rooms',
        action: 'INSERT' as const,
        recordId: '789',
        newValue: { name: 'Living Room' },
      };

      const mockAuditLog = {
        id: '4',
        tableName: 'rooms',
        action: 'INSERT',
        recordId: '789',
        timestamp: new Date(),
        userId: null,
        oldValue: null,
        newValue: JSON.stringify({ name: 'Living Room' }),
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(params);

      expect(mockRepository.create).toHaveBeenCalledWith({
        tableName: 'rooms',
        action: 'INSERT',
        recordId: '789',
        timestamp: expect.any(Date),
        userId: null,
        oldValue: null,
        newValue: JSON.stringify({ name: 'Living Room' }),
      });

      expect(result).toEqual(mockAuditLog);
    });

    it('should convert numeric recordId to string', async () => {
      const params = {
        tableName: 'devices',
        action: 'INSERT' as const,
        recordId: 999,
        newValue: { type: 'sensor' },
      };

      const mockAuditLog = {
        id: '5',
        tableName: 'devices',
        action: 'INSERT',
        recordId: '999',
        timestamp: new Date(),
        userId: null,
        oldValue: null,
        newValue: JSON.stringify({ type: 'sensor' }),
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(params);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recordId: '999',
        }),
      );

      expect(result).toEqual(mockAuditLog);
    });

    it('should handle undefined oldValue and newValue', async () => {
      const params = {
        tableName: 'devices',
        action: 'UPDATE' as const,
        recordId: '111',
      };

      const mockAuditLog = {
        id: '6',
        tableName: 'devices',
        action: 'UPDATE',
        recordId: '111',
        timestamp: new Date(),
        userId: null,
        oldValue: null,
        newValue: null,
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(params);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          oldValue: null,
          newValue: null,
        }),
      );

      expect(result).toEqual(mockAuditLog);
    });
  });
});
