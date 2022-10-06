
import internal from 'stream';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm';

@Entity()
export class user {

  @PrimaryColumn("varchar", {length: 8,
    unique : true,
    nullable : false})
  id: string;

  @Column("varchar", {length: 30, 
    unique : true, 
    nullable : false})
  username: string;

  @Column("varchar", {length: 30,
    nullable : false})
  mdp: string;

  @Column("varchar", {length : 260})
  avatar_loc: string;

  @Column("char")
  connect: number;

  @Column("int")
  rank: number;


  /** match hystory */
  @ManyToMany(
    () => match_hystory, (match_hystory) => match_hystory.win_id, (match_hystory) => match_hystory.los_id
  )
  matchs: match_hystory[]

  @ManyToMany(
    () => friend, (friend) => friend.user_id, (friend) => friend.friend_id)
  friends: friend[]

  @ManyToMany(
    () => block, (block) => block.user_id, (block) => block.block_id
  )
  blocks: block[]

  /** CHAT OWNER */
  @OneToMany(
    () => chat,
    chat => chat.owner_id
  )
  chats: chat[]

  @OneToMany(
    () => chat_connect,
    chat_connect => chat.user_id
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
  message_c: c_message[]
}

@Entity()
export class match_hystory {
    @PrimaryColumn

    @Column("char")
    win_score: number;
    @Column("char")
    los_score: number;
    @Column("bool",{default : false})
    rank_up: boolean;
    @Column()
    time: Date;

    @ManyToMany(()=> user, (user) => user.matchs)
    @JoinTable()
    win_id: user[]

    @ManyToMany(() => user, (user) => user.matchs)
    @JoinTable()
    los_id: user[]
	
}

@Entity()
export class friend {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => user, (user) => (user.friends))
    @JoinTable()
    user_id: user[]

    @ManyToMany(() => user, (user) => (user.friends))
    @JoinTable()
    friend_id: user[],
}

  @Entity()
  export class block {
  
      @PrimaryGeneratedColumn()
      id: number;
  
      @ManyToMany(() => user, (user) => (user.blocks))
      @JoinTable()
      user_id : user[];

      @ManyToMany(() => user, (user) => (user.blocks))
      @JoinTable()
      block_id : user[];
   }

@Entity()
export class chat {

  @PrimaryColumn("varchar", {length : 30,
    nullable : false,
    unique : true})
  id: string;

  @Column("char")
  status: number;

  @ManyToOne(
    () => user,
    user => user.chats
  )
  owner_id: user;

  @OneToMany(() => chat_connect, (chat_connect) => (chat_connect.chat_id))
  connections_chats : chat_connect[];

}

@Entity()
export class chat_connect {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => chat, (chat) => (chat.conections_chats))
  chat_id: chat;

  @ManyToOne(() => user, (user) => (user.connections))
  user_id : user;

  @Column("char")
  status : number;
}

@Entity()
export class message {

  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => user, (user) => (user.message_d))
  user_id: user;

  @ManyToOne(() => user, (user) => (user.message_d))
  sender_id: user;

  @Column()
  msg : string;
}

@Entity()
export class c_message {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => user, (user) => (user.message_c))
  sender_id: user;

  @ManyToOne(() => chat, (chat) => (chat.message_c))
  chat_id: user;

  @Column()
  msg : string;
}
