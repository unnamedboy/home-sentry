// src/home/entities/audit-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tableName: string;          // e.g. 'homes', 'rooms', 'devices', 'signals'

  @Column()
  action: string;             // 'INSERT' | 'UPDATE' | 'DELETE'

  @Column()
  recordId: string;           // target record primary key, stored as string

  @Column({ type: 'datetime' })
  timestamp: Date;            // operation time (UTC)

  @Column({ type: 'text', nullable: true })
  userId: string | null;      // who modified (null for now, will add auth later)

  @Column({ type: 'text', nullable: true })
  oldValue: string | null;    // JSON before change (optional)

  @Column({ type: 'text', nullable: true })
  newValue: string | null;    // JSON after change (optional)
}
