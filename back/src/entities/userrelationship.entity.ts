import { BaseEntity, Column, Entity, FindOptionsWhere, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

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

  static async relate(owner: User, related: User, status: UserRelationship.Status): Promise<UserRelationship> {
    return UserRelationship.save({
      owner: owner,
      related: related,
      status: status
    });
  }

  static async unRelate(owner: User, related: User) {
    return UserRelationship.delete({
      owner: owner,
      related: related
    } as FindOptionsWhere<UserRelationship>);
  }

  static async getStatus(owner: User, related: User): Promise<UserRelationship.Status | null> {
    const relationship = await UserRelationship.findOneBy({
      owner: owner,
      related: related
    } as FindOptionsWhere<UserRelationship>);
    if (!relationship)
      return null;
    return relationship.status;
  }

  static async getList(owner: User, status: UserRelationship.Status): Promise<User[]> {
    const relationships = await UserRelationship.find({
      relations: {
          related: true
      },
      where: {
        owner : owner,
        status: status
      } as FindOptionsWhere<UserRelationship>
    });
    const result = relationships.map((relationship) => relationship.related);
    return result;
  }

}

export namespace UserRelationship {
  export import Status = UserRelationshipStatus;
}
