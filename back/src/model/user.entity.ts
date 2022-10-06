import { PrimaryColumn, Column} from 'typeorm';

export abstract class UserEntity {
    @PrimaryColumn('ft_login', )
    ft_login: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isArchived: boolean;

    @Column({ type: 'varchar', length: 300 })
    createdBy: string;

    @Column({ type: 'varchar', length: 300 })
    lastChangedBy: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    internalComment: string | null;
}