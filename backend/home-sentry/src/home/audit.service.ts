import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async log(params: {
    tableName: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    recordId: string | number;
    userId?: string | null;
    oldValue?: any;
    newValue?: any;
  }) {
    const log = this.auditRepo.create({
      tableName: params.tableName,
      action: params.action,
      recordId: String(params.recordId),
      timestamp: new Date(),
      userId: params.userId ?? null,
      oldValue:
        params.oldValue !== undefined ? JSON.stringify(params.oldValue) : null,
      newValue:
        params.newValue !== undefined ? JSON.stringify(params.newValue) : null,
    });
    return this.auditRepo.save(log);
  }
}
