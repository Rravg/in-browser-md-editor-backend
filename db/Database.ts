import mysql from "mysql2";
import "dotenv/config";
import getErrorMessage from "../utils/getErrorMessage";

export default class Database {
    private static instance: Database;
    private static connection: mysql.Pool;

    private constructor() {
        Database.Init();
    }

    private static async Init() {
        try {
            await Database.CreateConnection();
            // await Database.Connect();
            await Database.StartTables();
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
        }
    }

    private static async CreateConnection(): Promise<void> {
        Database.connection = mysql.createPool({
            host: process.env.HOST as string,
            user: process.env.USER as string,
            password: process.env.PASSWORD as string,
            database: process.env.DB_NAME as string,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }

    // private static async Connect(): Promise<void> {
    //     Database.connection.connect();
    // }

    private static async StartTables(): Promise<void> {
        const promisePool = Database.connection.promise();
        await promisePool.execute(
            "CREATE TABLE IF NOT EXISTS users (\
                user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,\
                username VARCHAR(16) NOT NULL,\
                password VARCHAR(128) NOT NULL,\
                PRIMARY KEY (user_id),\
                UNIQUE (username)\
            )"
        );

        await promisePool.execute(
            "CREATE TABLE IF NOT EXISTS documents(\
                document_id INT UNSIGNED NOT NULL AUTO_INCREMENT,\
                document_name VARCHAR(32) NOT NULL,\
                document_body TEXT,\
                created_at VARCHAR(16) NOT NULL,\
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

    public getConnection(): mysql.Pool {
        return Database.connection;
    }
}
