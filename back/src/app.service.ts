import { Injectable, OnModuleInit } from '@nestjs/common';
import { identity } from 'rxjs';
import { FindOptionsWhere } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelUser } from './entities/channeluser.entity';
import { Message } from './entities/message.entity';
import { User } from './entities/user.entity';
import { UserRelationship } from './entities/userrelationship.entity';

@Injectable()
export class AppService implements OnModuleInit {

  async onModuleInit() {
    //  ********** FOR DEVELOPMENT ONLY **********
    //  Uncomment the single line below to activate the example generation on application load.
    await this.generateExamples();

    await User.reinitSockets();
  }

  // genere les exemples
  async generateExamples() {
    await User.save([
      {
        ft_login: 'iromanova',
        username: 'aroma',
        avatarURL: 'no_image.jpg',
        level:  3,
        xp: 657
      },
      {
        ft_login: 'lbintein',
        username: 'labintei',
        avatarURL: 'no_image.jpg',
        level:  5,
        xp: 628
      },
      {
        ft_login: 'omarecha',
        username: 'bmarecha',
        avatarURL: 'no_image.jpg',
        level:  2,
        xp: 0
      },
      {
        ft_login: 'edjubert',
        username: 'edjavid',
        avatarURL: 'no_image.jpg',
        level:  3,
        xp: 231
      },
      {
        ft_login: 'lraffin',
        username: 'jraffin',
        avatarURL: 'no_image.jpg',
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
    let chan = (await Channel.findOneBy({name: "testChannel"}))
    if (!chan)
      chan = await Channel.save({
        name: "testChannel",
        status: Channel.Status.PUBLIC,
        users: [
          {
            user: {ft_login:"jraffin"},
            status: ChannelUser.Status.OWNER,
            joined: true
          }
        ]
      });
    await User.refreshRanks();
  }
}
