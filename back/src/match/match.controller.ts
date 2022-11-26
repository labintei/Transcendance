import { Controller, Delete, Get, NotFoundException, Param, Patch, Put, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

@Controller('match')
@UseGuards(TransGuard)
export class MatchController {
    @Get("history")
    async gethistory(@Request() req): Promise<Match[]> {
        const me = await User.findByLogin(req.user.login);
        return await Match.find({
            relations:{
                user1:true,
                user2:true
            },
            where:[{
                    user1: me
                } as FindOptionsWhere<Match>,
                {
                    user2: me
                } as FindOptionsWhere<Match>
            ]
        });
    }
}
