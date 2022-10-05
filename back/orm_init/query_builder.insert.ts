import { DataSource } from "typeorm";

import {user, match_hystory, friend} from "";
import {message , c_message} from "src/user.entity";

/** user */

await DataSource
        .createQueryBuilder()
        .insert()
        .into(user)
        .values([
            {username: "username", ft_pseudo: "pseudo", mdp: "mdp", avatar_loc: "avatar", rank: 2},
        ])
        .execute()

/** match_hystory */

await DataSource
        .createQueryBuilder()
        .insert(match_hystory)
        .values([
            {win_id: 1, win_score: 20, los_id: 3, los_score: 10, rank_up: false, time: 0},
        ])
        .execute()

/** friend */

await DataSource
        .createQueryBuilder()
        .insert(friend)
        .values([
            {user_id: 1, friend_id: 3},
        ])
        .execute()

/** block */

await DataSource
        .createQueryBuilder()
        .insert(block)
        .values([
            {user_id: 1, block_id: 3},
        ])
        .execute()

/** chat */

await DataSource
        .createQueryBuilder()
        .insert(chat)
        .values([
            {name: "channel", owner_id: 1, status: 0},
        ])
        .execute()

/**  chat-connect */

await DataSource
        .createQueryBuilder()
        .insert(chat-connect)
        .values([
            {user_id: 1, chat_id: 1, status: 0},
        ])
        .execute()

/** chat_messages */

await DataSource
        .createQueryBuilder()
        .insert(c_message)
        .values([
            {sender_id: 1, chat_id:1 , msg: "ffrreerijijio"},
        ])
        .execute()

/** friend_messages */

await DataSource
        .createQueryBuilder()
        .insert(message)
        .values([
            {sender_id: 1, user_id: 3, msg: "fwfwfewfewfe"},
        ])
        .execute()


