import internal from 'stream';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
/** faire touts les imports */


/**
 * Les Differentes Options
 * eager : (bool) : la relation sera load dans la main entity en utilisant la methode find* ou QueryBuilder de l entitee
 * cascade; (bool) (insert | update) si vrai l objet en relation sera inseree ou updated dans la database
 * onDELETE " RESTRICT | CASCADE | SET NULL" specifiies comment les foreign key sont delete oar rapport a l objet referenceees
 * nullable: (bool) NULL , NOT NULL
 * orphaneRowAction: "nullify"| "delete"|"softdelete" parent saved sans enfants "pas besoin"
 */

/** Les Differentes options
 * @JoinCollumn , Quel cote de la colone est la colone de jointure vers une clee etrangere
 * Permet de personnaliser nom de colonne de jointure et nom de colonne referencee
 */

/** 
@ManyToMany(type => a)
@JoinTable({
  name: "table_jonction", // table name pour la jonction
  joinColumn: {
    name: "",
    referencedColumnName: "id"
  },
  inverseJoinColumn: {
    name: "a",
    referencedColumnName: "user_ID"
  } 
})
as: A[];
*/


/** pour simplifier les choses 
 * 
 * Les clees etrangeres ne seront jamais du cote de user
 * toutes les modif se feront au niveau de user
 * 
 * type de relation par rapport a user
 * 
 * OneToMany (user:id/chat:owner_id) ManyToOne
 * OneToMany (message_chat)
 * ManyToMany (user:id)(friend,block,messages)
 * 
 * 
*/

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

  /** Je gere les clees etrangeres ici */
  /** referenced ColumnName marche comme references */
  @ManyToOne(type => match_hystory, { cascade: ["update", "insert", "remove", "soft-remove", "recover"],})
  @JoinColumn([
    { name: "id", referencedColumnName: "win_id"},
    { name: "id", referencedColumnName: "user_id"}
  ]) // decorateurs optioinel sauf pour @OneToOne
  matchs: match_hystory;
  
  @ManyToMany(() => match_hystory, (match_hystory) => match_hystory.win_id)
  matchs_win: match_hystory[];
  @ManyToMany(() => match_hystory, (match_hystory) => match_hystory.los_id)
  matchs_lose: match_hystory[];
  /** Je me demande si je peut faire ca */
  /** @ManytoMany(() => match_hystory, (match_hystory) => match_hystory.los_id , (match_hystory) => match_hystory.win_id)
   *  matchs: match_hystory[];
   */
  // REFAIRE LA MEME CHOSE EN INVERSEE

  @OneToMany(() => friend, (friend) => friend.user_id, (friend) =>)

  @OneToMany(() => chat, (chat) => chat.owner_id)
  chats: chat[];

  // ok la foreign key n est que d un seul cote
}

@Entity()
export class match_hystory {
    
    @OneToOne(() => user, (user) => user.id)
    @JoinColumn()
    win_id: user;

    @OneToOne(() => user, (user) => user.id)
    @JoinColumn()
    los_id: user;

    @Column("char")
    win_score: number;
    @Column("char")
    los_score: number;
    @Column("bool",{default : false})
    rank_up: boolean;
    @Column()
    time: Date;
}

@Entity()
export class friend {
  @Column()
  user_id: number;
  @Column()
  friend_id:number;
}

@Entity()
export class block {
  @Column()
  user_id: number;
  @Column()
  block_id:number;
}

@Entity()
export class chat {
  @PrimaryGeneratedColumn()
  id: number;
  @Column("varchar", {length : 30,
    nullable : false,
    unique : true})
  name: string;

  @Column("char")
  status: number;

  @ManyToOne(
    () => user,
    user => user.id
  )
  @JoinColumn({
    name: 'owner_id'
  })
  user: user
}

@Entity()
export class chat_connect {
  @Column()
  chat_id : number;
  @Column()
  user_id : number;
  @Column("char")
  status : number;
}

@Entity()
export class message {
  @Column()
  sender_id : number;
  @Column()
  user_id : number;
  @Column()
  msg : string;
}

@Entity()
export class c_message {
  @Column()
  sender_id : number;
  @Column()
  chat_id : number;
  @Column()
  msg : string;
}
