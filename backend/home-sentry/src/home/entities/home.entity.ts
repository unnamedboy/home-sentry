import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RoomEntity } from "./room.entity";

@Entity('homes')
export class HomeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // IANA Timezone id, e.g., "Europe/Berlin"
  @Column({ type: 'text', nullable: true })
  timezone: string | null;

  
  @OneToMany(() => RoomEntity, (room) => room.home)
  rooms: RoomEntity[];
}
