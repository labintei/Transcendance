import { DataSource } from "typeorm";

/** les differentes Update */

/** user */
/** variables qui peuvent etre update : username, mdp, avatar_loc, connect, rank*/

/** modifier plusieurs donnees a la fois  */

await DataSource
    .createQueryBuilder()
    .update(user)
    .set({username:"userr",mdp: "mdp",})
    .where("id= :id", {id;1})
    .execute()


/** connect met connecter a l id 1 */
await DataSource
        .createQueryBuilder()
        .update(user)
        .set({connect: 1})
        .where("id = :id", {id: 1})
        .execute()


/** rank ip de id 1 */

await DataSource
    .createQueryBuilder()
    .update(user)
    .set({rank: () => "rank + 1"})
    .where("id= :id", {id: 1})
    .execute()

/** connect-chat Le status peut changer /ban ....*/

await DataSource
    .createQueryBuilder()
    .update(connect)
    .set({status: 1})
    .where("id= id",{id:1})
    .execute()

