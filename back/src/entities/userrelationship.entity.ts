import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

enum UserRelationshipStatus {
  FRIEND = "Friend",
  BLOCKED = "Blocked"
};

@Entity('user_relationship')
export class UserRelationship {

  @PrimaryColumn({ type: 'varchar', name: 'owner' })
  ownerLogin: string;

  @PrimaryColumn({ type: 'varchar', name: 'related' })
  relatedLogin: string;

  @ManyToOne(() => User, (user) => (user.relationships))
  @JoinColumn({ name: 'owner' })
  owner: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'related' })
  related: User;

  @Column({
    type: 'enum',
    enum:  UserRelationshipStatus,
    default: UserRelationshipStatus.FRIEND
  })
  status: UserRelationshipStatus;
}

export namespace UserRelationship {
  export import Status = UserRelationshipStatus;
}
