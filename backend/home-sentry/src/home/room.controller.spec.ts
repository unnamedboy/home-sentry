import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

describe('RoomController', () => {
  let controller: RoomController;
  let service: RoomService;

  const mockRoomService = {
    findAll: jest.fn(),
    findByHome: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRoom = {
    id: 1,
    name: 'Living Room',
    floor: 'Ground Floor',
    home: { id: 1, name: 'My Home' },
    devices: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        { provide: RoomService, useValue: mockRoomService },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get<RoomService>(RoomService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all rooms when no homeId query', async () => {
      const rooms = [mockRoom, { ...mockRoom, id: 2, name: 'Bedroom' }];
      mockRoomService.findAll.mockResolvedValue(rooms);

      const result = await controller.findAll();

      expect(result).toEqual(rooms);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return rooms by homeId query', async () => {
      const rooms = [mockRoom];
      mockRoomService.findByHome.mockResolvedValue(rooms);

      const result = await controller.findAll('1');

      expect(result).toEqual(rooms);
      expect(service.findByHome).toHaveBeenCalledWith(1);
    });

    it('should handle undefined homeId query', async () => {
      const rooms = [mockRoom];
      mockRoomService.findAll.mockResolvedValue(rooms);

      const result = await controller.findAll(undefined);

      expect(result).toEqual(rooms);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a room by id', async () => {
      mockRoomService.findOne.mockResolvedValue(mockRoom);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockRoom);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when room not found', async () => {
      mockRoomService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a room with homeId and name', async () => {
      const createData = { homeId: 1, name: 'Kitchen' };
      const createdRoom = { id: 3, ...createData, floor: null };
      mockRoomService.create.mockResolvedValue(createdRoom);

      const result = await controller.create(createData);

      expect(result).toEqual(createdRoom);
      expect(service.create).toHaveBeenCalledWith(createData);
    });

    it('should create a room with homeId, name, and floor', async () => {
      const createData = { homeId: 1, name: 'Bedroom', floor: 'First Floor' };
      const createdRoom = { id: 3, ...createData };
      mockRoomService.create.mockResolvedValue(createdRoom);

      const result = await controller.create(createData);

      expect(result).toEqual(createdRoom);
      expect(service.create).toHaveBeenCalledWith(createData);
    });

    it('should create a room with null floor', async () => {
      const createData = { homeId: 1, name: 'Bathroom', floor: null };
      const createdRoom = { id: 3, ...createData };
      mockRoomService.create.mockResolvedValue(createdRoom);

      const result = await controller.create(createData);

      expect(result).toEqual(createdRoom);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('update', () => {
    it('should update a room with name only', async () => {
      const updateData = { name: 'Updated Room' };
      const updatedRoom = { ...mockRoom, ...updateData };
      mockRoomService.update.mockResolvedValue(updatedRoom);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedRoom);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update a room with floor only', async () => {
      const updateData = { floor: 'Second Floor' };
      const updatedRoom = { ...mockRoom, ...updateData };
      mockRoomService.update.mockResolvedValue(updatedRoom);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedRoom);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update a room with all fields', async () => {
      const updateData = { name: 'Master Bedroom', floor: 'Second Floor' };
      const updatedRoom = { ...mockRoom, ...updateData };
      mockRoomService.update.mockResolvedValue(updatedRoom);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedRoom);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return null when room not found', async () => {
      const updateData = { name: 'Updated' };
      mockRoomService.update.mockResolvedValue(null);

      const result = await controller.update(999, updateData);

      expect(result).toBeNull();
      expect(service.update).toHaveBeenCalledWith(999, updateData);
    });
  });

  describe('remove', () => {
    it('should remove a room', async () => {
      const response = { deleted: true };
      mockRoomService.remove.mockResolvedValue(response);

      const result = await controller.remove(1);

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
