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


// sssp

// @Entity()
// export class user {

//  @PrimaryColumn("varchar", {length: 8,
// unique : true,
//      nullable : false})
//   id: string;

//   @Column("varchar", {length: 30, 
//     unique : true, 
//     nullable : false})
//   username: string;

//   @Column("varchar", {length: 30,
//     nullable : false})
//   mdp: string;//

//   @Column("varchar", {length : 260})
//   avatar_loc: string;

//   @Column("char")
//   connect: number;

//   @Column("int")
//   rank: number;
/*
  @ManyToMany(
    () => match_hystory, (match_hystory) => match_hystory.user_win)
  matchs_win: match_hystory[]

  @ManyToMany(
    () => match_hystory, (match_hystory) => match_hystory.user_los)
  matchs_los: match_hystory[]

  @ManyToMany(
    () => friend, (friend) => friend.user_friend)
  friends_user: friend[]

  @ManyToMany(
    () => friend, (friend) => friend.friend_user)
  users_friend: friend[]

  @ManyToMany(
    () => block, (block) => block.user_id, (block) => block.block_id
  )
  blocks: block[]

  @OneToMany(
    () => chat,
    chat => chat.c_users
  )
  chats: chat[]

  @OneToMany(
    () => chat_connect,
    chat_connect => chat_connect.cc_users
  )
  connections: chat_connect[]

  @OneToMany(
    () => message,
    message => (message.sender_id),
    message => (message.user_id)
  )
  message_d: message[]

  @OneToMany(
    () => c_message,
    c_message => (c_message.sender_id)
  )
  message_c: c_message[]*/
// }

