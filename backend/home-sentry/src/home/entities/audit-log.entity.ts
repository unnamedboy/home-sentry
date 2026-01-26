// src/home/entities/audit-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tableName: string;          // 比如 'homes', 'rooms', 'devices', 'signals'

  @Column()
  action: string;             // 'INSERT' | 'UPDATE' | 'DELETE'

  @Column()
  recordId: string;           // 目标记录的主键，统一用 string 存

  @Column({ type: 'datetime' })
  timestamp: Date;            // 操作时间（UTC）

  @Column({ type: 'text', nullable: true })
  userId: string | null;      // 谁改的（可以先留 null，将来接 auth）

  @Column({ type: 'text', nullable: true })
  oldValue: string | null;    // 修改前的 JSON（可选）

  @Column({ type: 'text', nullable: true })
  newValue: string | null;    // 修改后的 JSON（可选）
}
