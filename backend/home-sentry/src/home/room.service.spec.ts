import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomService } from './room.service';
import { AuditService } from './audit.service';
import { RoomEntity } from './entities/room.entity';
import { HomeEntity } from './entities/home.entity';

describe('RoomService', () => {
  let service: RoomService;
  let roomRepository: Repository<RoomEntity>;
  let homeRepository: Repository<HomeEntity>;
  let auditService: AuditService;

  const mockHome: HomeEntity = {
    id: 1,
    name: 'My Home',
    timezone: 'UTC',
    rooms: [],
  };

  const mockRoom: RoomEntity = {
    id: 1,
    name: 'Living Room',
    floor: 'Ground Floor',
    home: mockHome,
    devices: [],
  };

  const mockRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockHomeRepository = {
    findOne: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(RoomEntity),
          useValue: mockRoomRepository,
        },
        {
          provide: getRepositoryToken(HomeEntity),
          useValue: mockHomeRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    roomRepository = module.get<Repository<RoomEntity>>(getRepositoryToken(RoomEntity));
    homeRepository = module.get<Repository<HomeEntity>>(getRepositoryToken(HomeEntity));
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all rooms with relations', async () => {
      const rooms = [mockRoom, { ...mockRoom, id: 2 }];
      mockRoomRepository.find.mockResolvedValue(rooms);

      const result = await service.findAll();

      expect(result).toEqual(rooms);
      expect(roomRepository.find).toHaveBeenCalledWith({ relations: ['home'] });
    });

    it('should return empty array', async () => {
      mockRoomRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByHome', () => {
    it('should return rooms for a specific home', async () => {
      const rooms = [mockRoom];
      mockRoomRepository.find.mockResolvedValue(rooms);

      const result = await service.findByHome(1);

      expect(result).toEqual(rooms);
      expect(roomRepository.find).toHaveBeenCalledWith({
        where: { home: { id: 1 } },
        relations: ['home'],
      });
    });

    it('should return empty array when no rooms in home', async () => {
      mockRoomRepository.find.mockResolvedValue([]);

      const result = await service.findByHome(999);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a room by id with relations', async () => {
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRoom);
      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['home'],
      });
    });

    it('should return null when room not found', async () => {
      mockRoomRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a room with valid homeId', async () => {
      const createData = { homeId: 1, name: 'Kitchen', floor: 'Ground Floor' };
      const createdRoom = { id: 3, ...createData, home: mockHome, devices: [] };
      
      mockHomeRepository.findOne.mockResolvedValue(mockHome);
      mockRoomRepository.create.mockReturnValue(createdRoom);
      mockRoomRepository.save.mockResolvedValue(createdRoom);

      const result = await service.create(createData);

      expect(result).toEqual(createdRoom);
      expect(homeRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(roomRepository.create).toHaveBeenCalledWith({
        home: mockHome,
        name: 'Kitchen',
        floor: 'Ground Floor',
      });
      expect(roomRepository.save).toHaveBeenCalledWith(createdRoom);
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'rooms',
        action: 'INSERT',
        recordId: 3,
        newValue: createdRoom,
      });
    });

    it('should create a room with null floor', async () => {
      const createData = { homeId: 1, name: 'Bathroom', floor: null };
      const createdRoom = { id: 3, name: 'Bathroom', floor: null, home: mockHome, devices: [] };
      
      mockHomeRepository.findOne.mockResolvedValue(mockHome);
      mockRoomRepository.create.mockReturnValue(createdRoom);
      mockRoomRepository.save.mockResolvedValue(createdRoom);

      const result = await service.create(createData);

      expect(result).toEqual(createdRoom);
      expect(roomRepository.create).toHaveBeenCalledWith({
        home: mockHome,
        name: 'Bathroom',
        floor: null,
      });
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'rooms',
        action: 'INSERT',
        recordId: 3,
        newValue: createdRoom,
      });
    });

    it('should throw error when home not found', async () => {
      const createData = { homeId: 999, name: 'Kitchen' };
      
      mockHomeRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createData)).rejects.toThrow('Home 999 not found');
      expect(roomRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a room with name', async () => {
      const updateData = { name: 'Updated Room' };
      const originalRoom = JSON.parse(JSON.stringify(mockRoom));
      const updatedRoom = { ...mockRoom, ...updateData };
      
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockRoomRepository.save.mockResolvedValue(updatedRoom);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedRoom);
      expect(roomRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(roomRepository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'rooms',
        action: 'UPDATE',
        recordId: 1,
        oldValue: originalRoom,
        newValue: updatedRoom,
      });
    });

    it('should update a room with floor', async () => {
      const updateData = { floor: 'Second Floor' };
      const originalRoom = JSON.parse(JSON.stringify(mockRoom));
      const updatedRoom = { ...mockRoom, ...updateData };
      
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockRoomRepository.save.mockResolvedValue(updatedRoom);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedRoom);
      expect(result?.floor).toBe('Second Floor');
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'rooms',
        action: 'UPDATE',
        recordId: 1,
        oldValue: originalRoom,
        newValue: updatedRoom,
      });
    });

    it('should return null when room not found', async () => {
      const updateData = { name: 'Updated' };
      mockRoomRepository.findOne.mockResolvedValue(null);

      const result = await service.update(999, updateData);

      expect(result).toBeNull();
      expect(roomRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a room', async () => {
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockRoomRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ deleted: true });
      expect(roomRepository.delete).toHaveBeenCalledWith(1);
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'rooms',
        action: 'DELETE',
        recordId: 1,
        oldValue: mockRoom,
        newValue: null,
      });
    });
  });
});