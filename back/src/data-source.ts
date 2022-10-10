import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "db",
    port: 5432,
    username: "user",
    password: "user",
    database: "postgresql",
    synchronize: true,
    logging: true,
    entities: ['src/entity/*.entity.{js,ts}'],
    migrations: [],
    subscribers: []
})

/*
AppDataSource.initialize()

On peut faire une initialisation a partir d ici
*/

