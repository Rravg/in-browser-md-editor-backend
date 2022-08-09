import mysql from "mysql2/promise";
import "dotenv/config";
import getErrorMessage from "../utils/getErrorMessage";

export default class Database {
    private static instance: Database;
    private static connection: mysql.Connection;

    private constructor() {
        Database.Init();
    }

    private static async Init() {
        try {
            await Database.CreateConnection();
            await Database.Connect();
            await Database.StartTables();
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
        }
    }

    private static async CreateConnection(): Promise<void> {
        Database.connection = await mysql.createConnection({
            host: process.env.HOST as string,
            user: process.env.USER as string,
            password: process.env.PASSWORD as string,
            database: process.env.DB_NAME as string,
        });
    }

    private static async Connect(): Promise<void> {
        Database.connection.connect();
    }

    private static async StartTables(): Promise<void> {
        await Database.connection.execute(
            "CREATE TABLE IF NOT EXISTS users (\
                user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,\
                username VARCHAR(16) NOT NULL,\
                email VARCHAR(32) NOT NULL,\
                password VARCHAR(32) NOT NULL,\
                PRIMARY KEY (user_id),\
                UNIQUE (username),\
                UNIQUE (email)\
            )"
        );

        await Database.connection.execute(
            "CREATE TABLE IF NOT EXISTS documents(\
                document_id INT UNSIGNED NOT NULL AUTO_INCREMENT,\
                document_name VARCHAR(16) NOT NULL,\
                document_body VARCHAR(255),\
                created_at DATE NOT NULL,\
                user_id INT UNSIGNED NOT NULL,\
                PRIMARY KEY (document_id),\
                FOREIGN KEY (user_id) REFERENCES users(user_id)\
            )"
        );
    }

    public static getDatabase(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public getConnection(): mysql.Connection {
        return Database.connection;
    }
}
