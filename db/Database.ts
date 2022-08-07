import mysql from "mysql2";

export default class Database {
    private static instance: Database;
    private static connection: mysql.Connection = mysql.createConnection({
        host: process.env.HOST as string,
        user: process.env.USER as string,
        password: process.env.PASSWORD as string,
        database: "markdown_editor",
    });
    
    private constructor() {
        Database.Connect();
        Database.StartTables();
    }

    private static Connect() {
        Database.connection.connect((err: mysql.QueryError | null) => {
            if (err) throw err;
            console.log("- MySQL connection successful");
        });
    }

    private static StartTables() {
        Database.connection.execute(
            "CREATE TABLE IF NOT EXISTS users (\
                user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,\
                username VARCHAR(16) NOT NULL,\
                email VARCHAR(255) NOT NULL,\
                password VARCHAR(32) NOT NULL,\
                PRIMARY KEY (user_id),\
                UNIQUE (username),\
                UNIQUE (email)\
            )",
            function (err: mysql.QueryError | null) {
                if (err) throw err;
            }
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
