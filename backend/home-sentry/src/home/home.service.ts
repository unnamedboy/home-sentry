import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeEntity } from './entities/home.entity';
import { AuditService } from './audit.service';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(HomeEntity)
    private readonly homeRepo: Repository<HomeEntity>,
    private readonly auditService: AuditService,
  ) {}

  // List all homes
  findAll() {
    return this.homeRepo.find();
  }

  // Find a single home by id
  findOne(id: number) {
    return this.homeRepo.findOne({ where: { id } });
  }

  // Create a new home
  async create(data: { name: string; timezone?: string | null }) {
    const home = this.homeRepo.create({
      name: data.name,
      timezone: data.timezone ?? null,
    });

    const saved = await this.homeRepo.save(home);

    // Audit: INSERT
    await this.auditService.log({
      tableName: 'homes',
      action: 'INSERT',
      recordId: saved.id,
      newValue: saved,
      // userId: pass current user id here when auth is integrated
    });

    return saved;
  }

  // Update an existing home
  async update(
    id: number,
    data: { name?: string; timezone?: string | null },
  ) {
    const home = await this.homeRepo.findOne({ where: { id } });
    if (!home) {
      return null;
    }

    const old = { ...home }; // shallow copy for audit

    if (data.name !== undefined) home.name = data.name;
    if (data.timezone !== undefined) home.timezone = data.timezone;

    const saved = await this.homeRepo.save(home);

    // Audit: UPDATE
    await this.auditService.log({
      tableName: 'homes',
      action: 'UPDATE',
      recordId: saved.id,
      oldValue: old,
      newValue: saved,
      // userId: pass current user id here when auth is integrated
    });

    return saved;
  }

  // Delete a home
  async remove(id: number) {
    const home = await this.homeRepo.findOne({ where: { id } });

    await this.homeRepo.delete(id);

    // Audit: DELETE
    await this.auditService.log({
      tableName: 'homes',
      action: 'DELETE',
      recordId: id,
      oldValue: home ?? null,
      newValue: null,
      // userId: pass current user id here when auth is integrated
    });

    return { deleted: true };
  }
}
