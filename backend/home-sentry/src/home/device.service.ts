import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity } from './entities/device.entity';
import { RoomEntity } from './entities/room.entity';
import { AuditService } from './audit.service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepo: Repository<DeviceEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
    private readonly auditService: AuditService,
  ) {}

  // List all devices (with room relation)
  findAll() {
    return this.deviceRepo.find({ relations: ['room'] });
  }

  // List devices by room id
  findByRoom(roomId: number) {
    return this.deviceRepo.find({
      where: { room: { id: roomId } },
      relations: ['room'],
    });
  }

  // Find a single device by id
  findOne(id: number) {
    return this.deviceRepo.findOne({
      where: { id },
      relations: ['room'],
    });
  }

  // Create a new device
  async create(data: {
    roomId?: number | null;
    name: string;
    kind: string;
    source?: string;
    sourceRef?: string | null;
  }) {
    let room: RoomEntity | null = null;

    if (data.roomId !== undefined && data.roomId !== null) {
      const found = await this.roomRepo.findOne({ where: { id: data.roomId } });
      if (!found) {
        throw new Error(`Room ${data.roomId} not found`);
      }
      room = found;
    }

    const device = this.deviceRepo.create({
      room,
      name: data.name,
      kind: data.kind,
      source: data.source ?? 'home_assistant',
      sourceRef: data.sourceRef ?? null,
    });

    const saved = await this.deviceRepo.save(device);

    // Audit: INSERT
    await this.auditService.log({
      tableName: 'devices',
      action: 'INSERT',
      recordId: saved.id,
      newValue: saved,
      // userId: pass current user id here when auth is integrated
    });

    return saved;
  }

  // Update an existing device
  async update(
    id: number,
    data: {
      roomId?: number | null;
      name?: string;
      kind?: string;
      source?: string;
      sourceRef?: string | null;
    },
  ) {
    const device = await this.deviceRepo.findOne({
      where: { id },
      relations: ['room'],
    });
    if (!device) return null;

    const old = { ...device }; // shallow copy for audit

    if (data.roomId !== undefined) {
      if (data.roomId === null) {
        device.room = null;
      } else {
        const room = await this.roomRepo.findOne({ where: { id: data.roomId } });
        if (!room) {
          throw new Error(`Room ${data.roomId} not found`);
        }
        device.room = room;
      }
    }

    if (data.name !== undefined) device.name = data.name;
    if (data.kind !== undefined) device.kind = data.kind;
    if (data.source !== undefined) device.source = data.source;
    if (data.sourceRef !== undefined) device.sourceRef = data.sourceRef;

    const saved = await this.deviceRepo.save(device);

    // Audit: UPDATE
    await this.auditService.log({
      tableName: 'devices',
      action: 'UPDATE',
      recordId: saved.id,
      oldValue: old,
      newValue: saved,
      // userId: pass current user id here when auth is integrated
    });

    return saved;
  }

  // Delete a device
  async remove(id: number) {
    const device = await this.deviceRepo.findOne({ where: { id } });

    await this.deviceRepo.delete(id);

    // Audit: DELETE
    await this.auditService.log({
      tableName: 'devices',
      action: 'DELETE',
      recordId: id,
      oldValue: device ?? null,
      newValue: null,
      // userId: pass current user id here when auth is integrated
    });

    return { deleted: true };
  }
}
