import { Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import Database from "../db/Database";
import getErrorMessage from "../utils/getErrorMessage";

interface User {
    username: string;
    password: string;
}

export default class UserController {
    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();

        const username: string = req.body.username as string;
        const email: string = req.body.email as string;
        const password: string = req.body.password as string;

        // console.log(`username: ${username}, email: ${email}, password: ${password}`);

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

    static async Login(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();

        const username: string = req.body.username as string;
        const password: string = req.body.password as string;

        // console.log(`username: ${username}, password: ${password}`);

        try {
            const [result, fields] = await connection.execute(
                "SELECT username, password FROM users WHERE username = ?",
                [username]
            );

            const row = (<RowDataPacket[]>result)[0];
            const user: User = {
                username: row.username,
                password: row.password,
            };

            if (password === user.password) {
                // regenerate session
                req.session.regenerate(function (err) {
                    if (err) next(err);
                });

                // store user information in user
                req.session.user = user.username;

                // save session
                req.session.save();

                res.json({ msg: "login successful" });
            } else {
                res.json({ msg: "incorrect password" });
            }
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async Logout(req: Request, res: Response, next: NextFunction) {
        // clear user from session
        req.session.user = null;
        req.session.save(function (err) {
            if (err) next(err);

            req.session.regenerate(function (err) {
                if (err) next(err);
            });
        });

        res.json({ msg: "logout" });
    }
}
