import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Message {

  @PrimaryGeneratedColumn('uuid')
  id: number;

  //@CreateDateColumn('timestamptz')
  //time: Date;

  @Column('varchar')
  content: string;

  @ManyToOne(() => User, user => user.username)
  sender: User;
}
