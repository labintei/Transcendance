import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

enum MatchStatus {
  MATCHED = "Matched",
  ONGOING = "Ongoing",
  ENDED = "Ended"
}

@Entity('match')
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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1' })
  user1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2' })
  user2: User;
}

export namespace Match {
  export import Status = MatchStatus;
}
