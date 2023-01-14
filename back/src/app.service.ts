import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Match } from './entities/match.entity';
import { UserRelationship } from './entities/userrelationship.entity';

@Injectable()
export class AppService implements OnModuleInit {

  async onModuleInit() {
    //  ********** FOR DEVELOPMENT ONLY **********
    //  Uncomment the single line below to activate the example generation on application load.
    await this.generateExamples();

    await User.reinitSockets();
  }

  async generateExamples() {
    await User.save([
      {
        ft_login: 'iromanova',
        username: 'aroma',
        avatarURL: '',
        level:  3,
        xp: 657
      },
      {
        ft_login: 'lbintein',
        username: 'labintei',
        avatarURL: 'jpg',
        level:  5,
        xp: 628
      },
      {
        ft_login: 'omarecha',
        username: 'bmarechafaux',
        avatarURL: 'png',
        level:  2,
        xp: 0
      },
      {
        ft_login: 'edjubert',
        username: 'edjavid',
        avatarURL: '',
        level:  3,
        xp: 231
      },
      {
        ft_login: 'lraffin',
        username: 'jraffin',
        avatarURL: 'png',
        level:  1,
        xp: 630
      },
      {
        ft_login: 'jraffin',
        username: 'jraffin1',
        twoFASecret: null,//"EYPCCGBLGN6HYBYMKA7SOYQROZKU4RYQ",
        avatarURL: 'https://cdn.intra.42.fr/users/57b6404e1c58329a2ca86db66c132b62/jraffin.jpg',
        level:  3,
        xp: 587,
        status: User.Status.OFFLINE
      }
    ]);
    await UserRelationship.save([
      {
        ownerLogin: "jraffin",
        relatedLogin: "lbintein",
        status: UserRelationship.Status.FRIEND
      } as UserRelationship,
      {
        ownerLogin: "jraffin",
        relatedLogin: "omarecha",
        status: UserRelationship.Status.FRIEND
      } as UserRelationship,
      {
        ownerLogin: "jraffin",
        relatedLogin: "iromanova",
        status: UserRelationship.Status.BLOCKED
      } as UserRelationship
    ]);
    await User.refreshRanks();
  }
}
