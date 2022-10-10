import { Entity, PrimaryGeneratedColumn, Column ,PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm'

@Entity()
export class chat_connect {

  @PrimaryGeneratedColumn()
  id: number;
/*
  @ManyToOne(() => chat, (chat) => (chat.c_chats))
  @JoinColumn({name: 'chat_id', referencedColumnName: 'id'})
  chats: chat;

  @ManyToOne(() => user, (user) => (user.connections))
  @JoinColumn({name: 'owner_id', referencedColumnName: 'id'})
  cc_users: user;
*/
  @Column("char")
  status : number;
}
