import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

export enum ChannelUserStatus {
  FRIEND = "Friend",
  BLOCKED = "Blocked"
}

@Entity()
export class UserRelation {

  @ManyToOne(() => User)
  @PrimaryColumn('varchar')
  user: User;

  @ManyToOne(() => User)
  @PrimaryColumn('varchar')
  relation: User;

  @Column({ default: ChannelUserStatus.FRIEND })
  status: ChannelUserStatus;
}
