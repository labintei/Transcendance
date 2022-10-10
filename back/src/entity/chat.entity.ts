import { Entity, PrimaryGeneratedColumn, Column ,PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm'

@Entity()
export class chat {

  @PrimaryColumn("varchar", {length : 30,
    nullable : false,
    unique : true})
  id: string;

  @Column("char")
  status: number;
/*
  @ManyToOne(() => user, user => user.chats)
  @JoinColumn({name: 'owner_id', referencedColumnName: 'id'})
  c_users: user;

  @OneToMany(() => chat_connect, (chat_connect) => (chat_connect.chats))
  c_chats : chat_connect[];
*/
}
