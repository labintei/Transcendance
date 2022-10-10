import { Column, CreateDateColumn, Double, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Message {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn('timestamptz')
  time: Date;

  @ManyToOne(() => User, user => user.username)
  sender: User;

  @Column('varchar')
  content: string;
}
