import { PrimaryColumn, Column} from 'typeorm';

export class User {
    @PrimaryColumn({ type: 'varchar', length: 32 })
    username: string;

    @PrimaryColumn({ type: 'varchar', length: 12 })
    ft_login: string;

    @Column({ type: 'varchar', length: 32 })
    twoFA: string;


}