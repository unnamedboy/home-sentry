import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { HomeEntity } from './entities/home.entity';
import { AuditService } from './audit.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
    @InjectRepository(HomeEntity)
    private readonly homeRepo: Repository<HomeEntity>,
    private readonly auditService: AuditService,
  ) {}

  // List all rooms (with home relation)
  findAll() {
    return this.roomRepo.find({ relations: ['home'] });
  }

  // List rooms by home id
  findByHome(homeId: number) {
    return this.roomRepo.find({
      where: { home: { id: homeId } },
      relations: ['home'],
    });
  }

  // Find a single room by id
  findOne(id: number) {
    return this.roomRepo.findOne({
      where: { id },
      relations: ['home'],
    });
  }

  // Create a new room
  async create(data: { homeId: number; name: string; floor?: string | null }) {
    const home = await this.homeRepo.findOne({ where: { id: data.homeId } });
    if (!home) {
      throw new Error(`Home ${data.homeId} not found`);
    }

    const room = this.roomRepo.create({
      home,
      name: data.name,
      floor: data.floor ?? null,
    });

    const saved = await this.roomRepo.save(room);

    // Audit: INSERT
    await this.auditService.log({
      tableName: 'rooms',
      action: 'INSERT',
      recordId: saved.id,
      newValue: saved,
      // userId: pass current user id here when auth is integrated
    });

    return saved;
  }

  // Update an existing room
  async update(
    id: number,
    data: { name?: string; floor?: string | null },
  ) {
    const room = await this.roomRepo.findOne({ where: { id } });
    if (!room) {
      return null;
    }

    const old = { ...room }; // shallow copy for audit

    if (data.name !== undefined) room.name = data.name;
    if (data.floor !== undefined) room.floor = data.floor;

    const saved = await this.roomRepo.save(room);

    // Audit: UPDATE
    await this.auditService.log({
      tableName: 'rooms',
      action: 'UPDATE',
      recordId: saved.id,
      oldValue: old,
      newValue: saved,
      // userId: pass current user id here when auth is integrated
    });

    return saved;
  }

  // Delete a room
  async remove(id: number) {
    const room = await this.roomRepo.findOne({ where: { id } });

    await this.roomRepo.delete(id);

    // Audit: DELETE
    await this.auditService.log({
      tableName: 'rooms',
      action: 'DELETE',
      recordId: id,
      oldValue: room ?? null,
      newValue: null,
      // userId: pass current user id here when auth is integrated
    });

    return { deleted: true };
  }
}
