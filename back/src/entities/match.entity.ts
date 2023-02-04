import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn, BaseEntity, Index } from 'typeorm';
import { User } from './user.entity';

enum MatchStatus {
  NEW = "New",
  ONGOING = "Ongoing",
  ENDED = "Finished"
}

@Entity('match')
export class Match extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  time: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.NEW
  })
  status: MatchStatus;

  @Column({ type: 'smallint', default: 0 })
  score1: number;

  @Column({ type: 'smallint', default: 0 })
  score2: number;

  @Index()
  @Column({ type: 'varchar', name: 'user1', nullable: true})
  user1Login: string;

  @Index()
  @Column({ type: 'varchar', name: 'user2', nullable: true})
  user2Login: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: 'user1' })
  user1: User;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: 'user2' })
  user2: User;

  async resolve() {
    this.status = Match.Status.ENDED;
    await this.save();
    const max_score = Math.max(this.score1, this.score2);
    const score_diff = max_score - Math.min(this.score1, this.score2);
    /*
    ** Fixed or score-based gains or losses of XP for either won/drawed or lost thises.
    ** expressed in percentage of other player's XP amount required to pass to next level.
    */
    const fixedPercentGain = 20;
    const scorePercentGain = 30;
    const fixedPercentLoss = 10;
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
    console.log("[MATCH END] (" + this.score1 + " - " + this.score2 + ")");
    if (this.score1 >= this.score2) {
      const fixed = (this.user2.xpAmountForNextLevel() * fixedPercentGain / 100);
      const score_related = score_diff ? (this.user2.xpAmountForNextLevel() * scorePercentGain * (score_diff / max_score) / 100) : 0
      this.user1.gainXP(Math.floor(fixed + score_related));
    }
    else{
      const fixed = (this.user1.xpAmountForNextLevel() * fixedPercentLoss / 100);
      const score_related = score_diff ? (this.user1.xpAmountForNextLevel() * scorePercentLoss * (score_diff / max_score) / 100) : 0
      this.user1.looseXP(Math.floor(fixed + score_related));
    }
    if (this.score2 >= this.score1) {
      const fixed = (this.user1.xpAmountForNextLevel() * fixedPercentGain / 100);
      const score_related = score_diff ? (this.user1.xpAmountForNextLevel() * scorePercentGain * (score_diff / max_score) / 100) : 0
      this.user2.gainXP(Math.floor(fixed + score_related));
    }
    else {
      const fixed = (this.user2.xpAmountForNextLevel() * fixedPercentLoss / 100);
      const score_related = score_diff ? (this.user2.xpAmountForNextLevel() * scorePercentLoss * (score_diff / max_score) / 100) : 0
      this.user2.looseXP(Math.floor(fixed + score_related));
    }
    await this.user1.save();
    await this.user2.save();
    await User.refreshRanks();
  }

  static async clearOngoing() {
    Match.delete({ status: MatchStatus.ONGOING });
  }

}

export namespace Match {
  export import Status = MatchStatus;
}
