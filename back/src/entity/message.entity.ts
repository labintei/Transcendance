import { Entity, PrimaryGeneratedColumn, Column ,PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm'

@Entity()
export class message {

  @PrimaryGeneratedColumn()
  id: number;

/*
  @ManyToOne(() => user, (user) => (user.message_d))
  user_id: user;

  @ManyToOne(() => user, (user) => (user.message_d))
  sender_id: user;
*/
  @Column()
  msg : string;
}
