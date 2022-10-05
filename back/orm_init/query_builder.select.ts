

/** utiliser datasource directement */

import { DataSource } from "typeorm";

/** user */

/** profil user de lau */

const profil = await DataSource
                .createQueryBuilder('user')
                .where("user.id = id", {id: lau})
                .getOne()

/** match-history */

/** chat messages a envoyer de lo aux chat */


/**
 * Techniquement
 * left join
 * CHAT
 * block
 */

const user_chat_send = await DataSource
            .createQueryBuilder('user')
            .leftJoinAndSelect('')
            .
            .where("block.id = :id", { id: lo})
            .where()