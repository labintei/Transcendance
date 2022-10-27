import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

export enum RelationStatus {
  FRIEND = "Friend",
  BLOCKED = "Blocked"
}

@Entity('user_relation')
export class UserRelation {

  @PrimaryColumn('varchar')
  owner: User;

  @PrimaryColumn('varchar')
  related: User;

  @ManyToOne(() => User, (user) => (user.relations))
  @JoinColumn({ name: 'owner' })
  owner_setfk: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'related' })
  related_setfk: User;

  @Column({ default: RelationStatus.FRIEND })
  status: RelationStatus;
}
