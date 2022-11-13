import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { User } from './user.entity';

enum MatchStatus {
  MATCHED = "Matched",
  ONGOING = "Ongoing",
  ENDED = "Finished"
}

@Entity('match')
export class Match extends BaseEntity {

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

  async resolve() {
    this.status = Match.Status.ENDED;
    const max_score = Math.max(this.score1, this.score2);
    const score_diff = max_score - Math.min(this.score1, this.score2);
    /*
    ** Fixed or score-based gains or losses of XP for either won/drawed or lost thises.
    ** expressed in percentage of other player's XP amount required to pass to next level.
    */
    const fixedPercentGain = 4;
    const scorePercentGain = 6;
    const fixedPercentLoss = 5;
    const scorePercentLoss = 0;
    //  Resolve user counters.
    if (this.score1 == this.score2) {
      ++this.user1.draws;
      ++this.user2.draws;
    }
    else if (this.score1 > this.score2) {
      ++this.user1.victories;
      ++this.user2.defeats;
    }
    else {
      ++this.user2.victories;
      ++this.user1.defeats;
    }
    // Resolve users XP gains/losses.
    if (this.score1 >= this.score2)
      this.user1.gainXP(
        (this.user2.xpAmountForNextLevel * fixedPercentGain) / 100 +
        (this.user2.xpAmountForNextLevel * scorePercentGain) * (score_diff / max_score) / 100
      );
    else
      this.user1.gainXP(
        (this.user2.xpAmountForNextLevel * fixedPercentLoss) / 100 +
        (this.user2.xpAmountForNextLevel * scorePercentLoss) * (score_diff / max_score) / 100
      );
    if (this.score2 >= this.score1)
      this.user2.gainXP(
        (this.user1.xpAmountForNextLevel * fixedPercentGain) / 100 +
        (this.user1.xpAmountForNextLevel * scorePercentGain) * (score_diff / max_score) / 100
      );
    else
      this.user2.gainXP(
        (this.user1.xpAmountForNextLevel * fixedPercentLoss) / 100 +
        (this.user1.xpAmountForNextLevel * scorePercentLoss) * (score_diff / max_score) / 100
      );
    User.refreshRanks();
  }

}

export namespace Match {
  export import Status = MatchStatus;
}
