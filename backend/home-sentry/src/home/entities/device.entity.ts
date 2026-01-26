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
  kind: string;          // "thermostat" / "sensor" / "valve" / "media_player" 等

  // 来源系统，例如 "home_assistant" / "custom" / "zigbee2mqtt"
  @Column({ default: 'home_assistant' })
  source: string;

  // 和源系统的 id 关联，比如 HA 的 entity_id 或 device_id
  @Column({ type: 'text', nullable: true })
  sourceRef: string | null;     // 如 "climate.living_room"

  @OneToMany(() => SignalEntity, (s) => s.device)
  signals: SignalEntity[];
}
