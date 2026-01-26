import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeService } from './home.service';
import { AuditService } from './audit.service';
import { HomeEntity } from './entities/home.entity';

describe('HomeService', () => {
  let service: HomeService;
  let repository: Repository<HomeEntity>;
  let auditService: AuditService;

  const mockHome: HomeEntity = {
    id: 1,
    name: 'My Home',
    timezone: 'UTC',
    rooms: [],
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: getRepositoryToken(HomeEntity),
          useValue: mockRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    repository = module.get<Repository<HomeEntity>>(getRepositoryToken(HomeEntity));
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all homes', async () => {
      const homes = [mockHome, { ...mockHome, id: 2 }];
      mockRepository.find.mockResolvedValue(homes);

      const result = await service.findAll();

      expect(result).toEqual(homes);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should return empty array', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a home by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockHome);

      const result = await service.findOne(1);

      expect(result).toEqual(mockHome);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when home not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('create', () => {
    it('should create a home with name and timezone', async () => {
      const createData = { name: 'New Home', timezone: 'America/New_York' };
      const createdHome = { id: 3, ...createData, rooms: [] };
      
      mockRepository.create.mockReturnValue(createdHome);
      mockRepository.save.mockResolvedValue(createdHome);

      const result = await service.create(createData);

      expect(result).toEqual(createdHome);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'New Home',
        timezone: 'America/New_York',
      });
      expect(repository.save).toHaveBeenCalledWith(createdHome);
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'homes',
        action: 'INSERT',
        recordId: 3,
        newValue: createdHome,
      });
    });

    it('should create a home with null timezone', async () => {
      const createData = { name: 'New Home', timezone: null };
      const createdHome = { id: 3, name: 'New Home', timezone: null, rooms: [] };
      
      mockRepository.create.mockReturnValue(createdHome);
      mockRepository.save.mockResolvedValue(createdHome);

      const result = await service.create(createData);

      expect(result).toEqual(createdHome);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'New Home',
        timezone: null,
      });
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'homes',
        action: 'INSERT',
        recordId: 3,
        newValue: createdHome,
      });
    });

    it('should create a home without timezone', async () => {
      const createData = { name: 'New Home' };
      const createdHome = { id: 3, name: 'New Home', timezone: null, rooms: [] };
      
      mockRepository.create.mockReturnValue(createdHome);
      mockRepository.save.mockResolvedValue(createdHome);

      const result = await service.create(createData);

      expect(result).toEqual(createdHome);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'New Home',
        timezone: null,
      });
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'homes',
        action: 'INSERT',
        recordId: 3,
        newValue: createdHome,
      });
    });
  });

  describe('update', () => {
    it('should update a home with name', async () => {
      const updateData = { name: 'Updated Home' };
      const originalHome = JSON.parse(JSON.stringify(mockHome));
      const updatedHome = { ...mockHome, ...updateData };
      
      mockRepository.findOne.mockResolvedValue(mockHome);
      mockRepository.save.mockResolvedValue(updatedHome);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedHome);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'homes',
        action: 'UPDATE',
        recordId: 1,
        oldValue: originalHome,
        newValue: updatedHome,
      });
    });

    it('should update a home with timezone', async () => {
      const updateData = { timezone: 'Europe/London' };
      const originalHome = JSON.parse(JSON.stringify(mockHome));
      const updatedHome = { ...mockHome, ...updateData };
      
      mockRepository.findOne.mockResolvedValue(mockHome);
      mockRepository.save.mockResolvedValue(updatedHome);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedHome);
      expect(result?.timezone).toBe('Europe/London');
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'homes',
        action: 'UPDATE',
        recordId: 1,
        oldValue: originalHome,
        newValue: updatedHome,
      });
    });

    it('should return null when home not found', async () => {
      const updateData = { name: 'Updated' };
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update(999, updateData);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should not update name if not provided', async () => {
      const updateData = { timezone: 'Asia/Tokyo' };
      const updatedHome = { ...mockHome, ...updateData };
      
      mockRepository.findOne.mockResolvedValue({ ...mockHome });
      mockRepository.save.mockResolvedValue(updatedHome);

      await service.update(1, updateData);

      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a home', async () => {
      mockRepository.findOne.mockResolvedValue(mockHome);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ deleted: true });
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'homes',
        action: 'DELETE',
        recordId: 1,
        oldValue: mockHome,
        newValue: null,
      });
    });
  });
});
