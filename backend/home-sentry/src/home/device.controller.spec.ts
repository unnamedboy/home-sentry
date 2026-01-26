import { Test, TestingModule } from '@nestjs/testing';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

describe('DeviceController', () => {
  let controller: DeviceController;
  let service: DeviceService;

  const mockDeviceService = {
    findAll: jest.fn(),
    findByRoom: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRoom = {
    id: 1,
    name: 'Living Room',
    floor: 'Ground Floor',
  };

  const mockDevice = {
    id: 1,
    name: 'Light',
    kind: 'light',
    source: 'home_assistant',
    sourceRef: 'light.living_room',
    room: mockRoom,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        { provide: DeviceService, useValue: mockDeviceService },
      ],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
    service = module.get<DeviceService>(DeviceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all devices when no roomId query', async () => {
      const devices = [mockDevice, { ...mockDevice, id: 2, name: 'Fan' }];
      mockDeviceService.findAll.mockResolvedValue(devices);

      const result = await controller.findAll();

      expect(result).toEqual(devices);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findByRoom).not.toHaveBeenCalled();
    });

    it('should return devices by roomId query', async () => {
      const devices = [mockDevice];
      mockDeviceService.findByRoom.mockResolvedValue(devices);

      const result = await controller.findAll('1');

      expect(result).toEqual(devices);
      expect(service.findByRoom).toHaveBeenCalledWith(1);
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it('should handle undefined roomId query', async () => {
      const devices = [mockDevice];
      mockDeviceService.findAll.mockResolvedValue(devices);

      const result = await controller.findAll(undefined);

      expect(result).toEqual(devices);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a device by id', async () => {
      mockDeviceService.findOne.mockResolvedValue(mockDevice);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockDevice);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when device not found', async () => {
      mockDeviceService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a device with roomId', async () => {
      const createData = { roomId: 1, name: 'Thermostat', kind: 'climate' };
      const createdDevice = { id: 3, ...createData, source: 'home_assistant', sourceRef: null };
      mockDeviceService.create.mockResolvedValue(createdDevice);

      const result = await controller.create(createData);

      expect(result).toEqual(createdDevice);
      expect(service.create).toHaveBeenCalledWith(createData);
    });

    it('should create a device without roomId', async () => {
      const createData = { name: 'Motion Sensor', kind: 'motion' };
      const createdDevice = { id: 3, ...createData, roomId: null, source: 'home_assistant', sourceRef: null };
      mockDeviceService.create.mockResolvedValue(createdDevice);

      const result = await controller.create(createData);

      expect(result).toEqual(createdDevice);
      expect(service.create).toHaveBeenCalledWith(createData);
    });

    it('should create a device with all fields', async () => {
      const createData = { roomId: 1, name: 'Light', kind: 'light', source: 'home_assistant', sourceRef: 'light.living_room' };
      const createdDevice = { id: 3, ...createData };
      mockDeviceService.create.mockResolvedValue(createdDevice);

      const result = await controller.create(createData);

      expect(result).toEqual(createdDevice);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('update', () => {
    it('should update a device with name', async () => {
      const updateData = { name: 'Updated Light' };
      const updatedDevice = { ...mockDevice, ...updateData };
      mockDeviceService.update.mockResolvedValue(updatedDevice);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedDevice);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update a device with roomId', async () => {
      const updateData = { roomId: 2 };
      const updatedDevice = { ...mockDevice, ...updateData, room: { id: 2, name: 'Bedroom' } };
      mockDeviceService.update.mockResolvedValue(updatedDevice);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedDevice);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update a device and clear roomId', async () => {
      const updateData = { roomId: null };
      const updatedDevice = { ...mockDevice, room: null };
      mockDeviceService.update.mockResolvedValue(updatedDevice);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedDevice);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update a device with all fields', async () => {
      const updateData = { roomId: 2, name: 'New Light', kind: 'light', source: 'custom', sourceRef: 'custom.light' };
      const updatedDevice = { ...mockDevice, ...updateData };
      mockDeviceService.update.mockResolvedValue(updatedDevice);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedDevice);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return null when device not found', async () => {
      const updateData = { name: 'Updated' };
      mockDeviceService.update.mockResolvedValue(null);

      const result = await controller.update(999, updateData);

      expect(result).toBeNull();
      expect(service.update).toHaveBeenCalledWith(999, updateData);
    });
  });

  describe('remove', () => {
    it('should remove a device', async () => {
      const response = { deleted: true };
      mockDeviceService.remove.mockResolvedValue(response);

      const result = await controller.remove(1);

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
