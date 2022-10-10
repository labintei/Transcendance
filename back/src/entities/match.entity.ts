import { Column, CreateDateColumn, Double, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum MatchStatus {
  MATCHED = "Matched",
  ONGOING = "Ongoing",
  ENDED = "Ended"
}

@Entity()
export class Match {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn('timestamptz')
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