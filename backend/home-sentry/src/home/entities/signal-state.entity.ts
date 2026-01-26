// src/environment/entities/signal-state.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SignalEntity } from './signal.entity';

@Entity('signal_states')
export class SignalState {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SignalEntity, (s) => s.states, { nullable: false })
  @JoinColumn({ name: 'signal_id' })
  signal: SignalEntity;

  // utc timestamp
  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ type: 'text' })
  rawValue: string;

  @Column({ type: 'real', nullable: true })
  numericValue: number;

  // There are some extra metadata in JSON format
  @Column({ type: 'text', nullable: true })
  extraJson: string;
}
