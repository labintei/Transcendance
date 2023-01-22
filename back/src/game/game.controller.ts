import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { LogAsJraffin } from 'src/auth/logAsJraffin.dummyGuard';
import { TransGuard } from 'src/auth/trans.guard';
import { Match } from 'src/entities/match.entity';

@Controller('match')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class GameController {

	@Get('history')
	async gethistory(@Request() req): Promise<Match[]> {
		return Match.find({
			select: Match.defaultFilter,
			relations: {
				user1:true,
				user2:true
			},
			where: [
				{
					user1: {
						ft_login: req.user
					}
				},
				{
					user2: {
						ft_login: req.user
					}
				}
			]
		});
	}

}
