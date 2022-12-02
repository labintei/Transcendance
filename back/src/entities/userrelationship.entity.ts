import { BaseEntity, Column, Entity, FindOptionsSelect, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

const userRelationshipDefaultFilter: FindOptionsSelect<UserRelationship> = {
  owner: {
		username: true
	},
  related: {
		username: true
	},
  status: true
};

enum UserRelationshipStatus {
  FRIEND = "Friend",
  BLOCKED = "Blocked"
};

@Entity('user_relationship')
export class UserRelationship extends BaseEntity {

  @PrimaryColumn({ type: 'varchar', name: 'owner' })
  ownerLogin: string;

  @PrimaryColumn({ type: 'varchar', name: 'related' })
  relatedLogin: string;

  @ManyToOne(() => User, (user) => (user.relationships), { onDelete: "CASCADE" })
  @JoinColumn({ name: 'owner' })
  owner: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'related' })
  related: User;

  @Column({
    type: 'enum',
    enum:  UserRelationshipStatus,
    default: UserRelationshipStatus.FRIEND
  })
  status: UserRelationshipStatus;

  static async getList(owner: User, status: UserRelationship.Status): Promise<User[]> {
    const list = await User.createQueryBuilder("user")
      .innerJoinAndMapOne(
        "user.relationshipStatus",
        UserRelationship,
        "relationship",
        "relationship.related = user.ft_login AND relationship.owner = :ownerLogin AND relationship.status = :status",
        { ownerLogin: owner.ft_login, status: status })
      .getMany();
    console.log(list);
    const relationships = await UserRelationship.find({
      relations: {
          related: true
      },
      where: {
        owner : {
          ft_login: owner.ft_login
        },
        status: status
      }
    });
    const result = relationships.map((relationship) => relationship.related);
    return result;
  }

}

export namespace UserRelationship {
  export import Status = UserRelationshipStatus;
  export const defaultFilter = userRelationshipDefaultFilter;
}
