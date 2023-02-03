import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Match } from './entities/match.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ChannelUser } from './entities/channeluser.entity';

@Injectable()
export class AppService implements OnModuleInit {

  constructor(private injectedSchedulerRegistry: SchedulerRegistry) {}

  private static schedulerRegistry: SchedulerRegistry = null;

  async onModuleInit() {
    AppService.schedulerRegistry = this.injectedSchedulerRegistry;

    //  ********** FOR DEVELOPMENT ONLY **********
    //  Uncomment the single line below to activate the example generation
    //  on application load if there is no users in database.

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
        ft_login: 'aroma',
        username: 'Aurore',
        avatarURL: 'https://cdn.intra.42.fr/users/c56323996c7089134e85ad15844e5d35/aroma.jpg',
      },
      {
        ft_login: 'labintei',
        username: 'Lauranne',
        avatarURL: 'https://cdn.intra.42.fr/users/f1ddd5c9b21c63347225ada6c0c15ea7/labintei.jpg',
      },
      {
        ft_login: 'bmarecha',
        username: 'Baptiste',
        avatarURL: 'https://cdn.intra.42.fr/users/83281e807a42191e0b0baa08cb21eb8e/bmarecha.jpg',
      },
      {
        ft_login: 'edjavid',
        username: 'Eric',
        avatarURL: 'https://cdn.intra.42.fr/users/5e240384371e3dd4cf5fb10860d0d373/edjavid.jpg',
      },
      {
        ft_login: 'jraffin',
        username: 'Jonathan',
        avatarURL: 'https://cdn.intra.42.fr/users/57b6404e1c58329a2ca86db66c132b62/jraffin.jpg',
      }
    ]);
    await User.refreshRanks();
  }
}
