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
  _user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'relation' })
  _relation: User;

  @Column({ default: ChannelUserStatus.FRIEND })
  status: ChannelUserStatus;
}
