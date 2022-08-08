import { Request, Response, NextFunction } from "express";
import Database from "../db/Database";
import getErrorMessage from "../utils/getErrorMessage";


export default class UserController {
    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();

        const username: string = req.body.username as string;
        const email: string = req.body.email as string;
        const password: string = req.body.password as string;

        console.log(`username: ${username}, email: ${email}, password: ${password}`);

        try {
            await connection.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                [username, email, password]
            );

            res.json({ msg: "sign up" });
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }
}
