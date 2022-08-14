import { Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import Database from "../db/Database";
import getErrorMessage from "../utils/getErrorMessage";

interface User {
    username: string;
    password: string;
}

const welcome = {
    name: "welcome",
    content:
        "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```",
};

export default class UserController {
    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();

        const username: string = req.body.username as string;
        const password: string = req.body.password as string;

        try {
            await connection.execute("INSERT INTO users (username, password) VALUES (?, ?)", [
                username,
                password,
            ]);

            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [username]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;

            await connection.execute(
                "INSERT INTO documents (document_name, document_body, created_at, user_id) VALUES (?, ?, ?, ?)",
                [welcome.name, welcome.content, req.query.date, user_id]
            );

            res.json({ isAuth: true });
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(400).json({ error: message });
        }
    }

    static async Login(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();

        const username: string = req.body.username as string;
        const password: string = req.body.password as string;

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
                res.json({ isAuth: true });
            } else {
                res.json({ isAuth: false });
            }
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(400).json({ error: message, isAuth: false });
        }
    }

    static async Logout(req: Request, res: Response, next: NextFunction) {
        res.json({ msg: "logout" });
    }
}
