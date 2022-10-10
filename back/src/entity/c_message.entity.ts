import { Entity, PrimaryGeneratedColumn, Column ,PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm'

@Entity()
export class c_message {
  
  @PrimaryGeneratedColumn()
  id: number;
/*
  @ManyToOne(() => user, (user) => (user.message_c))
  sender_id: user;

  @ManyToOne(() => chat, (chat) => (chat.message_c))
  chat_id: user;
*/
  @Column()
  msg : string;
}