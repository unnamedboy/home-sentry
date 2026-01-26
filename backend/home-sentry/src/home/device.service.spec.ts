import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceService } from './device.service';
import { AuditService } from './audit.service';
import { DeviceEntity } from './entities/device.entity';
import { RoomEntity } from './entities/room.entity';

describe('DeviceService', () => {
  let service: DeviceService;
  let deviceRepository: Repository<DeviceEntity>;
  let roomRepository: Repository<RoomEntity>;
  let auditService: AuditService;

  const mockRoom: RoomEntity = {
    id: 1,
    name: 'Living Room',
    floor: 'Ground Floor',
    home: { id: 1, name: 'My Home', timezone: 'UTC', rooms: [] },
    devices: [],
  };

  const mockDevice: DeviceEntity = {
    id: 1,
    name: 'Light',
    kind: 'light',
    source: 'home_assistant',
    sourceRef: 'light.living_room',
    room: mockRoom,
    signals: [],
  };

  const mockDeviceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoomRepository = {
    findOne: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: getRepositoryToken(DeviceEntity),
          useValue: mockDeviceRepository,
        },
        {
          provide: getRepositoryToken(RoomEntity),
          useValue: mockRoomRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
    deviceRepository = module.get<Repository<DeviceEntity>>(getRepositoryToken(DeviceEntity));
    roomRepository = module.get<Repository<RoomEntity>>(getRepositoryToken(RoomEntity));
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all devices with relations', async () => {
      const devices = [mockDevice, { ...mockDevice, id: 2 }];
      mockDeviceRepository.find.mockResolvedValue(devices);

      const result = await service.findAll();

      expect(result).toEqual(devices);
      expect(deviceRepository.find).toHaveBeenCalledWith({ relations: ['room'] });
    });

    it('should return empty array', async () => {
      mockDeviceRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByRoom', () => {
    it('should return devices for a specific room', async () => {
      const devices = [mockDevice];
      mockDeviceRepository.find.mockResolvedValue(devices);

      const result = await service.findByRoom(1);

      expect(result).toEqual(devices);
      expect(deviceRepository.find).toHaveBeenCalledWith({
        where: { room: { id: 1 } },
        relations: ['room'],
      });
    });

    it('should return empty array when no devices in room', async () => {
      mockDeviceRepository.find.mockResolvedValue([]);

      const result = await service.findByRoom(999);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a device by id with relations', async () => {
      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);

      const result = await service.findOne(1);

      expect(result).toEqual(mockDevice);
      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['room'],
      });
    });

    it('should return null when device not found', async () => {
      mockDeviceRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a device with roomId', async () => {
      const createData = { roomId: 1, name: 'Light', kind: 'light' };
      const createdDevice = { 
        id: 3, 
        ...createData, 
        room: mockRoom, 
        source: 'home_assistant', 
        sourceRef: null,
        signals: [],
      };
      
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockDeviceRepository.create.mockReturnValue(createdDevice);
      mockDeviceRepository.save.mockResolvedValue(createdDevice);

      const result = await service.create(createData);

      expect(result).toEqual(createdDevice);
      expect(roomRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(deviceRepository.create).toHaveBeenCalledWith({
        room: mockRoom,
        name: 'Light',
        kind: 'light',
        source: 'home_assistant',
        sourceRef: null,
      });
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'INSERT',
        recordId: 3,
        newValue: createdDevice,
      });
    });

    it('should create a device without roomId', async () => {
      const createData = { name: 'Sensor', kind: 'motion' };
      const createdDevice = { 
        id: 3, 
        ...createData, 
        room: null,
        source: 'home_assistant',
        sourceRef: null,
        signals: [],
      };
      
      mockDeviceRepository.create.mockReturnValue(createdDevice);
      mockDeviceRepository.save.mockResolvedValue(createdDevice);

      const result = await service.create(createData);

      expect(result).toEqual(createdDevice);
      expect(roomRepository.findOne).not.toHaveBeenCalled();
      expect(deviceRepository.create).toHaveBeenCalledWith({
        room: null,
        name: 'Sensor',
        kind: 'motion',
        source: 'home_assistant',
        sourceRef: null,
      });
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'INSERT',
        recordId: 3,
        newValue: createdDevice,
      });
    });

    it('should create a device with custom source and sourceRef', async () => {
      const createData = { roomId: 1, name: 'Light', kind: 'light', source: 'custom', sourceRef: 'custom.light' };
      const createdDevice = { 
        id: 3, 
        ...createData,
        room: mockRoom,
        signals: [],
      };
      
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockDeviceRepository.create.mockReturnValue(createdDevice);
      mockDeviceRepository.save.mockResolvedValue(createdDevice);

      const result = await service.create(createData);

      expect(result).toEqual(createdDevice);
      expect(deviceRepository.create).toHaveBeenCalledWith({
        room: mockRoom,
        name: 'Light',
        kind: 'light',
        source: 'custom',
        sourceRef: 'custom.light',
      });
    });

    it('should throw error when room not found', async () => {
      const createData = { roomId: 999, name: 'Light', kind: 'light' };
      
      mockRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createData)).rejects.toThrow('Room 999 not found');
      expect(deviceRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a device with name', async () => {
      const updateData = { name: 'Updated Light' };
      const originalDevice = JSON.parse(JSON.stringify(mockDevice));
      const updatedDevice = { ...mockDevice, ...updateData };
      
      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockDeviceRepository.save.mockResolvedValue(updatedDevice);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedDevice);
      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['room'],
      });
      expect(deviceRepository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'UPDATE',
        recordId: 1,
        oldValue: originalDevice,
        newValue: updatedDevice,
      });
    });

    it('should update a device roomId', async () => {
      const newRoom = { id: 2, name: 'Bedroom' };
      const updateData = { roomId: 2 };
      const originalDevice = JSON.parse(JSON.stringify(mockDevice));
      const updatedDevice = { ...mockDevice, room: newRoom };
      
      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockRoomRepository.findOne.mockResolvedValue(newRoom);
      mockDeviceRepository.save.mockResolvedValue(updatedDevice);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedDevice);
      expect(roomRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'UPDATE',
        recordId: 1,
        oldValue: originalDevice,
        newValue: updatedDevice,
      });
    });

    it('should clear roomId when update with null', async () => {
      const updateData = { roomId: null };
      const originalDevice = JSON.parse(JSON.stringify(mockDevice));
      const updatedDevice = { ...mockDevice, room: null };
      
      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockDeviceRepository.save.mockResolvedValue(updatedDevice);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedDevice);
      expect(roomRepository.findOne).not.toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'UPDATE',
        recordId: 1,
        oldValue: originalDevice,
        newValue: updatedDevice,
      });
    });

    it('should throw error when new room not found', async () => {
      const updateData = { roomId: 999 };
      
      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateData)).rejects.toThrow('Room 999 not found');
      expect(deviceRepository.save).not.toHaveBeenCalled();
    });

    it('should return null when device not found', async () => {
      const updateData = { name: 'Updated' };
      mockDeviceRepository.findOne.mockResolvedValue(null);

      const result = await service.update(999, updateData);

      expect(result).toBeNull();
      expect(deviceRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a device', async () => {
      const response = { deleted: true };
      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockDeviceRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(response);
      expect(deviceRepository.delete).toHaveBeenCalledWith(1);
      expect(auditService.log).toHaveBeenCalledWith({
        tableName: 'devices',
        action: 'DELETE',
        recordId: 1,
        oldValue: mockDevice,
        newValue: null,
      });
    });
  });
});
