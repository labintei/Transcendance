import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum MatchStatus {
  MATCHED = "Matched",
  ONGOING = "Ongoing",
  ENDED = "Ended"
}

@Entity()
export class Match {

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @CreateDateColumn()
  time: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.MATCHED
  })
  status: MatchStatus;

  @Column('smallint')
  score1: number;

  @Column('smallint')
  score2: number;

  @ManyToOne(() => User, (user) => (user.username))
  user1: User;

  @ManyToOne(() => User, (user) => (user.username))
  user2: User;
}
