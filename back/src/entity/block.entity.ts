import { Entity, PrimaryGeneratedColumn, Column ,PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm'

  @Entity()
  export class block {
  
      @PrimaryGeneratedColumn()
      id: number;
/*  
      @ManyToMany(() => user, (user) => (user.blocks))
      @JoinTable()
      user_id : user[];

      @ManyToMany(() => user, (user) => (user.blocks))
      @JoinTable()
      block_id : user[];*/
   }
