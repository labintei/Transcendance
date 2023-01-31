import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Match } from './entities/match.entity';
import { UserRelationship } from './entities/userrelationship.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ChannelUser } from './entities/channeluser.entity';

@Injectable()
export class AppService implements OnModuleInit {

  constructor(private injectedSchedulerRegistry: SchedulerRegistry) {}

  private static schedulerRegistry: SchedulerRegistry = null;

  async onModuleInit() {
    AppService.schedulerRegistry = this.injectedSchedulerRegistry;

    //  ********** FOR DEVELOPMENT ONLY **********
    //  Uncomment the single line below to activate the example generation on application load.
    await AppService.generateExamples();
    //  ******************************************
  
    await User.clearOnlines();
    await Match.clearOngoing();
    await ChannelUser.setRightsTimeoutsOnStartup();
  }

  static deleteTimeout(name:string) {
    try {
      const timeout = this.schedulerRegistry.getTimeout(name);
      clearTimeout(timeout);
      this.schedulerRegistry.deleteTimeout(name);
    } catch (e) {}
  }

  static setTimeout(name:string, callback: () => void, delay_ms: number): NodeJS.Timeout {
    this.deleteTimeout(name);
    const timeout = setTimeout(callback, delay_ms);
    this.schedulerRegistry.addTimeout(name, timeout);
    return timeout
  }

  static getTimeout(name:string): NodeJS.Timeout | null {
    let timeout = null
    try {
      timeout = this.schedulerRegistry.getTimeout(name);
    } catch (e) {}
    return timeout;
  }

  static getRegisteredTimeoutNames(): string[] {
    return this.schedulerRegistry.getTimeouts();
  }

  static async generateExamples() {
    if (await User.count())
      return;
    await User.save([
      {
        ft_login: 'mromaniu',
        username: 'aroma',
        avatarURL: 'https://cdn.intra.42.fr/users/ebe52f582c2977e4de87dd696da8da21/mromaniu.jpg',
        level:  3,
        xp: 657
      },
      {
        ft_login: 'lbintein',
        username: 'labintei',
        avatarURL: 'https://cdn.intra.42.fr/users/01a2a13f37720f02d9fdde60ff6d0d9d/lbintein.jpg',
        level:  5,
        xp: 628
      },
      {
        ft_login: 'omarecha',
        username: 'bmarecha',
        avatarURL: 'https://cdn.intra.42.fr/users/9177de66b1fd572c2d94773048123d40/omarecha.jpg',
        level:  2,
        xp: 0
      },
      {
        ft_login: 'edjubert',
        username: 'edjavid',
        avatarURL: 'https://cdn.intra.42.fr/users/1ec9dc62a31cc116e4175a44e64b95d6/edjubert.jpg',
        level:  3,
        xp: 231
      },
      {
        ft_login: 'lraffin',
        username: 'jraffin',
        avatarURL: 'https://cdn.intra.42.fr/users/9ee1123451a11ed7bacb8bc7f301189d/lraffin.jpg',
        level:  1,
        xp: 630
      },
        {
        ft_login: 'jraffin',
        username: 'Jonathan',
        twoFASecret: null, //"EYPCCGBLGN6HYBYMKA7SOYQROZKU4RYQ",
        avatarURL: 'https://cdn.intra.42.fr/users/57b6404e1c58329a2ca86db66c132b62/jraffin.jpg',
        level:  3,
        xp: 587
      },
      {
        ft_login: 'bmarecha',
        username: 'bmarechavrai',
        avatarURL: 'https://cdn.intra.42.fr/users/83281e807a42191e0b0baa08cb21eb8e/bmarecha.jpg',
        level:  3,
        xp: 587
      }
    ]);
    await User.refreshRanks();
    await UserRelationship.save([
      {
        ownerLogin: "jraffin",
        relatedLogin: "lbintein",
        status: UserRelationship.Status.FRIEND
      },
      {
        ownerLogin: "jraffin",
        relatedLogin: "omarecha",
        status: UserRelationship.Status.FRIEND
      },
      {
        ownerLogin: "jraffin",
        relatedLogin: "mromaniu",
        status: UserRelationship.Status.BLOCKED
      }
    ]);
    await Match.save([
      {
        user1Login: "jraffin",
        user2Login: "bmarecha",
        score1: 12,
        score2: 100,
        status: Match.Status.ENDED
      }
    ]);
  }
}
