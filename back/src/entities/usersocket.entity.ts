import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('user_socket')
export class UserSocket extends BaseEntity {

  @PrimaryColumn({ type: 'varchar', name: 'id' })
  id: string;

  @Column({ type: 'varchar', name: 'user' })
  userLogin: string;

  @ManyToOne(() => User, { onDelete: "CASCADE",  cascade: ["update"] })
  @JoinColumn({ name: 'user' })
  user: User;

}
