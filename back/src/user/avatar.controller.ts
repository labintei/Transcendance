import { Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors, Request } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";

const editFileName = (req, file, callback) => {
    const name:string[] = file.originalname.split('.');
    let fileExtName:string;
    if (name.length > 1)
        fileExtName = name[name.length - 1];
    else
        fileExtName = "png";
    callback(null, `${req.user}-avatar.${fileExtName}`);
};

const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};

@Controller('avatar')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class AvatarController
{

    @Get()
    async getMy(@Request() req, @Res() res) {
        let me = await User.findOneBy({ft_login:req.user});
        let filename:string = req.user + "-avatar." + me.avatarURL;
        return res.sendFile(filename, {root: "./img"});
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
        destination:'./img',
        filename: editFileName,
        }),
        fileFilter: imageFileFilter
    }))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req, @Res() res) {
        const name:string[] = file.originalname.split('.');
        let fileExtName:string = name.at(-1);
        await User.update(req.user, {avatarURL:fileExtName});
        return res.sendFile(file.filename, {root: file.destination});
    }

    @Get(':username')
    async getUserAvatar(@Res() res, @Param('username') username) {
        let user = await User.findOneBy({username:username});
        let filename:string = user.ft_login + "-avatar." + user.avatarURL;
        return res.sendFile(filename, {root: "./img"});
    }

}