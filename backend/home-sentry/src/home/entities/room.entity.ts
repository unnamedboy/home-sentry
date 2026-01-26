import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { HomeEntity } from './home.entity';
import { DeviceEntity } from './device.entity';

@Entity('rooms')
export class RoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HomeEntity, (home) => home.rooms, { nullable: false })
  @JoinColumn({ name: 'home_id' })
  home: HomeEntity;

  @Column()
  name: string; // e.g. "living_room"

  @Column({ type: 'text', nullable: true })
  floor: string | null; // e.g. "first_floor"

  @OneToMany(() => DeviceEntity, (e) => e.room)
  devices: DeviceEntity[];
}
