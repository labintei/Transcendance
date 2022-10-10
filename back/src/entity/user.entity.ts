import { Entity, PrimaryGeneratedColumn, Column ,PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number
}


// @Entity()
// export class user {

//   @PrimaryColumn("varchar", {length: 8,
//     unique : true,
//     nullable : false})
//   id: string;

//   @Column("varchar", {length: 30, 
//     unique : true, 
//     nullable : false})
//   username: string;

//   @Column("varchar", {length: 30,
//     nullable : false})
//   mdp: string;

//   @Column("varchar", {length : 260})
//   avatar_loc: string;

//   @Column("char")
//   connect: number;

//   @Column("int")
//   rank: number;
// /*
//   @ManyToMany(
//     () => match_hystory, (match_hystory) => match_hystory.user_win)
//   matchs_win: match_hystory[]

//   @ManyToMany(
//     () => match_hystory, (match_hystory) => match_hystory.user_los)
//   matchs_los: match_hystory[]

//   @ManyToMany(
//     () => friend, (friend) => friend.user_friend)
//   friends_user: friend[]

//   @ManyToMany(
//     () => friend, (friend) => friend.friend_user)
//   users_friend: friend[]

//   @ManyToMany(
//     () => block, (block) => block.user_id, (block) => block.block_id
//   )
//   blocks: block[]

//   @OneToMany(
//     () => chat,
//     chat => chat.c_users
//   )
//   chats: chat[]

//   @OneToMany(
//     () => chat_connect,
//     chat_connect => chat_connect.cc_users
//   )
//   connections: chat_connect[]

//   @OneToMany(
//     () => message,
//     message => (message.sender_id),
//     message => (message.user_id)
//   )
//   message_d: message[]

//   @OneToMany(
//     () => c_message,
//     c_message => (c_message.sender_id)
//   )
//   message_c: c_message[]*/
// }

// @Entity()
// export class match_hystory {
    
//     @PrimaryGeneratedColumn()
//     id: number;

//     @Column("char")
//     win_score: number;
//     @Column("char")
//     los_score: number;
//     @Column("bool",{default : false})
//     rank_up: boolean;
//     @Column()
//     time: Date;
// /*
//     @ManyToMany(()=> user, (user) => user.matchs_win)
//     @JoinTable({joinColumn: {name: 'win_id', referencedColumnName: 'id'}})
//     user_win: user[]
	
//     @ManyToMany(()=> user, (user) => user.matchs_los)
//     @JoinTable({joinColumn: {name: 'los_id', referencedColumnName: 'id'}})
//     user_los: user[]
//   */
// }

// @Entity()
// export class friend {

//     @PrimaryGeneratedColumn()
//     id: number;
// /*
//     @ManyToMany(() => user, (user) => (user.friends_user))
//     @JoinTable(
//         {joinColumn: {name: 'friend_id', referencedColumnName: 'id'}})
//     user_friend: user[]

//     @ManyToMany(() => user, (user) => (user.users_friend))
//     @JoinTable(
//         {joinColumn: {name: 'user_id', referencedColumnName: 'id'}}
//     )
//     friend_user: user[]
// */
// }

//   @Entity()
//   export class block {
  
//       @PrimaryGeneratedColumn()
//       id: number;
// /*  
//       @ManyToMany(() => user, (user) => (user.blocks))
//       @JoinTable()
//       user_id : user[];

//       @ManyToMany(() => user, (user) => (user.blocks))
//       @JoinTable()
//       block_id : user[];*/
//    }

// @Entity()
// export class chat {

//   @PrimaryColumn("varchar", {length : 30,
//     nullable : false,
//     unique : true})
//   id: string;

//   @Column("char")
//   status: number;
// /*
//   @ManyToOne(() => user, user => user.chats)
//   @JoinColumn({name: 'owner_id', referencedColumnName: 'id'})
//   c_users: user;

//   @OneToMany(() => chat_connect, (chat_connect) => (chat_connect.chats))
//   c_chats : chat_connect[];
// */
// }

// @Entity()
// export class chat_connect {

//   @PrimaryGeneratedColumn()
//   id: number;
// /*
//   @ManyToOne(() => chat, (chat) => (chat.c_chats))
//   @JoinColumn({name: 'chat_id', referencedColumnName: 'id'})
//   chats: chat;

//   @ManyToOne(() => user, (user) => (user.connections))
//   @JoinColumn({name: 'owner_id', referencedColumnName: 'id'})
//   cc_users: user;
// */
//   @Column("char")
//   status : number;
// }

// @Entity()
// export class message {

//   @PrimaryGeneratedColumn()
//   id: number;

// /*
//   @ManyToOne(() => user, (user) => (user.message_d))
//   user_id: user;

//   @ManyToOne(() => user, (user) => (user.message_d))
//   sender_id: user;
// */
//   @Column()
//   msg : string;
// }

// @Entity()
// export class c_message {
  
//   @PrimaryGeneratedColumn()
//   id: number;
// /*
//   @ManyToOne(() => user, (user) => (user.message_c))
//   sender_id: user;

//   @ManyToOne(() => chat, (chat) => (chat.message_c))
//   chat_id: user;
// */
//   @Column()
//   msg : string;
// }

