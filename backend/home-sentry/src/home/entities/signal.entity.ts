// src/environment/entities/signal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { DeviceEntity } from './device.entity';
import { SignalState } from './signal-state.entity';

@Entity('signals')
export class SignalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DeviceEntity, (d) => d.signals, { nullable: false })
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @Column()
  name: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  valueType: string;

  @Column({ nullable: true })
  category: string;
  
  @OneToMany(() => SignalState, (s) => s.signal)
  states: SignalState[];
}
