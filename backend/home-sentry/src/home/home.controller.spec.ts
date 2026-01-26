import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

describe('HomeController', () => {
  let controller: HomeController;
  let service: HomeService;

  const mockHomeService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockHome = {
    id: 1,
    name: 'My Home',
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        { provide: HomeService, useValue: mockHomeService },
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    service = module.get<HomeService>(HomeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all homes', async () => {
      const homes = [mockHome, { ...mockHome, id: 2, name: 'Home 2' }];
      mockHomeService.findAll.mockResolvedValue(homes);

      const result = await controller.findAll();

      expect(result).toEqual(homes);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no homes exist', async () => {
      mockHomeService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a home by id', async () => {
      mockHomeService.findOne.mockResolvedValue(mockHome);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockHome);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when home not found', async () => {
      mockHomeService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a home with name only', async () => {
      const createData = { name: 'New Home' };
      const createdHome = { id: 3, ...createData, timezone: null };
      mockHomeService.create.mockResolvedValue(createdHome);

      const result = await controller.create(createData);

      expect(result).toEqual(createdHome);
      expect(service.create).toHaveBeenCalledWith(createData);
    });

    it('should create a home with name and timezone', async () => {
      const createData = { name: 'New Home', timezone: 'America/New_York' };
      const createdHome = { id: 3, ...createData };
      mockHomeService.create.mockResolvedValue(createdHome);

      const result = await controller.create(createData);

      expect(result).toEqual(createdHome);
      expect(service.create).toHaveBeenCalledWith(createData);
    });

    it('should create a home with null timezone', async () => {
      const createData = { name: 'New Home', timezone: null };
      const createdHome = { id: 3, ...createData };
      mockHomeService.create.mockResolvedValue(createdHome);

      const result = await controller.create(createData);

      expect(result).toEqual(createdHome);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('update', () => {
    it('should update a home with name only', async () => {
      const updateData = { name: 'Updated Home' };
      const updatedHome = { ...mockHome, ...updateData };
      mockHomeService.update.mockResolvedValue(updatedHome);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedHome);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update a home with timezone only', async () => {
      const updateData = { timezone: 'Europe/London' };
      const updatedHome = { ...mockHome, ...updateData };
      mockHomeService.update.mockResolvedValue(updatedHome);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedHome);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update a home with all fields', async () => {
      const updateData = { name: 'Updated', timezone: 'Asia/Tokyo' };
      const updatedHome = { ...mockHome, ...updateData };
      mockHomeService.update.mockResolvedValue(updatedHome);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(updatedHome);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return null when home not found', async () => {
      const updateData = { name: 'Updated' };
      mockHomeService.update.mockResolvedValue(null);

      const result = await controller.update(999, updateData);

      expect(result).toBeNull();
      expect(service.update).toHaveBeenCalledWith(999, updateData);
    });
  });

  describe('remove', () => {
    it('should remove a home', async () => {
      const response = { deleted: true };
      mockHomeService.remove.mockResolvedValue(response);

      const result = await controller.remove(1);

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
