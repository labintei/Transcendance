import { Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors, Request, NotFoundException, PreconditionFailedException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { existsSync } from "fs";
import { rm } from "fs/promises"
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
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(new PreconditionFailedException('Only image files are allowed!'), false);
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
        let fileExt = "png";
        let filename:string = req.user + "-avatar.";
        if (!existsSync("img/" + filename + fileExt)) {
            fileExt = "jpg";
            if (!existsSync("img/" + filename + fileExt)) {
                fileExt = "jpeg";
                if (!existsSync("img/" + filename + fileExt)) {
                    throw new NotFoundException("No images linked to this login.")
                }
            }
        }
        return res.sendFile(filename + fileExt, {root: "./img"});
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
        destination:'./img',
        filename: editFileName,
        }),
        fileFilter: imageFileFilter,
        limits: {fileSize: 1024*1024}
    }))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req, @Res() res) {
        const name:string[] = file.originalname.split('.');
        let fileExtName:string = name.at(-1);
        let fileExt = "png";
        let filename:string = req.user + "-avatar.";
        if (fileExtName === "png" || !existsSync("img/" + filename + fileExt)) {
            fileExt = "jpg";
            if (fileExtName === "jpg" || !existsSync("img/" + filename + fileExt)) {
                fileExt = "jpeg";
                if (fileExtName === "jpeg" || !existsSync("img/" + filename + fileExt)) {
                    fileExt = fileExtName;
                }
            }
        }
        if (fileExt !== fileExtName)
            rm("img/" + filename + fileExt);
        await User.update(req.user, {avatarURL:process.env.REACT_APP_BACKEND_URL + "avatar/" + req.user});
        return res.sendFile(file.filename, {root: file.destination});
    }

    @Get(':login')
    async getUserAvatar(@Res() res, @Param('login') login) {
        let fileExt = "png";
        let filename:string = login + "-avatar.";
        if (!existsSync("img/" + filename + fileExt)) {
            fileExt = "jpg";
            if (!existsSync("img/" + filename + fileExt)) {
                fileExt = "jpeg";
                if (!existsSync("img/" + filename + fileExt)) {
                    throw new NotFoundException("No images linked to this login.")
                }
            }
        }
        return res.sendFile(filename + fileExt, {root: "./img"});
    }

}