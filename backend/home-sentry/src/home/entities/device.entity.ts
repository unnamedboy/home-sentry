// src/environment/entities/device.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { SignalEntity } from './signal.entity';

@Entity('devices')
export class DeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomEntity, (room) => room.devices, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: RoomEntity | null;

  @Column()
  name: string;          // "Living Thermostat 1"

  @Column()
  kind: string;          // "thermostat" / "sensor" / "valve" / "media_player" etc.

  // source system, e.g. "home_assistant" / "custom" / "zigbee2mqtt"
  @Column({ default: 'home_assistant' })
  source: string;

  // reference to source system id, e.g. HA entity_id or device_id
  @Column({ type: 'text', nullable: true })
  sourceRef: string | null;     // e.g. "climate.living_room"

  @OneToMany(() => SignalEntity, (s) => s.device)
  signals: SignalEntity[];
}
