import { Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import Database from "../db/Database";
import getErrorMessage from "../utils/getErrorMessage";

export default class DocumentController {
    static async CreateDocument(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection().promise();

        const date: string = req.body.date as string;

        try {
            async function createUntitledDocument(num: number = 0): Promise<string> {
                let document_name: string = "untitled-document";

                let name_found = false;
                while (!name_found) {
                    const QUERY = "EXISTS (SELECT * FROM documents WHERE document_name = ?)";
                    let [check, check_fields] = await connection.execute(`SELECT ${QUERY}`, [
                        document_name,
                    ]);
                    const exists: number = (<RowDataPacket[]>check)[0][QUERY];
                    if (exists === 1) {
                        num = num + 1;
                        document_name = `untitled-document(${num})`;
                    } else {
                        name_found = true;
                    }
                }

                return document_name;
            }
            let new_document_name = await createUntitledDocument();
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.query.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;
            await connection.execute(
                "INSERT INTO documents (document_name, document_body, created_at, user_id) VALUES (?, ?, ?, ?)",
                [new_document_name, "", date, user_id]
            );

            res.json("New Document Created");
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async SaveDocument(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection().promise();

        const new_name: string = req.query.new_document_name as string;
        const old_name: string = req.query.old_document_name as string;
        const body: string = req.body.source as string;

        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.query.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;

            await connection.execute(
                "UPDATE documents SET document_name = ?, document_body = ? WHERE user_id = ? AND document_name = ?",
                [new_name, body, user_id, old_name]
            );
            res.json("Save Document");
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async DeleteDocument(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection().promise();
        const document_name: string = req.query.document_name as string;
        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.query.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;

            await connection.execute(
                "DELETE FROM documents WHERE user_id = ? AND document_name = ?",
                [user_id, document_name]
            );

            res.json("Delete Document");
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async GetDocuments(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection().promise();
        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.query.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;
            // console.log("user_id found ", user_id);

            const [documents, dFields] = await connection.execute(
                "SELECT document_name, created_at FROM documents WHERE user_id = ?",
                [user_id]
            );

            const user_documents = <RowDataPacket[]>documents;
            res.json({ documents: user_documents });
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async GetDocument(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection().promise();
        const document_name: string = req.query.document_name as string;
        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.query.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;
            const [document, dFields] = await connection.execute(
                "SELECT document_name, document_body FROM documents WHERE user_id = ? AND document_name = ?",
                [user_id, document_name]
            );

            const user_document = (<RowDataPacket[]>document)[0];
            res.json({ document: user_document });
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }
}
