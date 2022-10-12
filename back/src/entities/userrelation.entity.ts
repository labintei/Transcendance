import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

export enum ChannelUserStatus {
  FRIEND = "Friend",
  BLOCKED = "Blocked"
}

@Entity()
export class UserRelation {

  @PrimaryColumn('varchar')
  user: User;

  @PrimaryColumn('varchar')
  relation: User;

  @ManyToOne(() => User, (user) => (user.relations))
  @JoinColumn({ name: 'user' })
  user_setfk: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'relation' })
  relation_setfk: User;

  @Column({ default: ChannelUserStatus.FRIEND })
  status: ChannelUserStatus;
}
