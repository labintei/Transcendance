import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MatchService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    private userService: UserService
  ) {}

  async createMatch(user1: User, user2: User) {
    return this.manager.save(this.manager.create(Match, { user1: user1, user2: user2 }));
  }

  async resolveMatch(match: Match) {
    match.status = Match.Status.ENDED;
    const max_score = Math.max(match.score1, match.score2);
    const score_diff = max_score - Math.min(match.score1, match.score2);
    /*
    ** Fixed or score-based gains or losses of XP for either won/drawed or lost matches.
    ** expressed in percentage of other player's XP amount required to pass to next level.
    */
    const fixedPercentGain = 4;
    const scorePercentGain = 6;
    const fixedPercentLoss = 5;
    const scorePercentLoss = 0;
    //  Resolve user counters.
    if (match.score1 == match.score2) {
      ++match.user1.draws;
      ++match.user2.draws;
    }
    else if (match.score1 > match.score2) {
      ++match.user1.victories;
      ++match.user2.defeats;
    }
    else {
      ++match.user2.victories;
      ++match.user1.defeats;
    }
    // Resolve users XP gains/losses.
    if (match.score1 >= match.score2)
      this.userService.gainXP(match.user1,
        (this.userService.xpAmountForNextLevel(match.user2) * fixedPercentGain) / 100 +
        (this.userService.xpAmountForNextLevel(match.user2) * scorePercentGain) * (score_diff / max_score) / 100
      );
    else
      this.userService.gainXP(match.user1,
        (this.userService.xpAmountForNextLevel(match.user2) * fixedPercentLoss) / 100 +
        (this.userService.xpAmountForNextLevel(match.user2) * scorePercentLoss) * (score_diff / max_score) / 100
      );
    if (match.score2 >= match.score1)
      this.userService.gainXP(match.user2,
        (this.userService.xpAmountForNextLevel(match.user1) * fixedPercentGain) / 100 +
        (this.userService.xpAmountForNextLevel(match.user1) * scorePercentGain) * (score_diff / max_score) / 100
      );
    else
      this.userService.gainXP(match.user2,
        (this.userService.xpAmountForNextLevel(match.user1) * fixedPercentLoss) / 100 +
        (this.userService.xpAmountForNextLevel(match.user1) * scorePercentLoss) * (score_diff / max_score) / 100
      );
  }

}
