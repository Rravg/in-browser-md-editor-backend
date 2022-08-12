import { Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import Database from "../db/Database";
import getErrorMessage from "../utils/getErrorMessage";

export default class DocumentController {
    static async CreateDocument(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();

        const name: string = req.body.name as string;
        const body: string = req.body.body as string;
        const date: string = req.body.date as string;

        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.query.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;

            await connection.execute(
                "INSERT INTO documents (document_name, document_body, created_at, user_id) VALUES (?, ?, ?, ?)",
                [name, body, date, user_id]
            );

            res.json("New Document Created");
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async SaveDocument(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();

        const name: string = req.body.name as string;
        const body: string = req.body.body as string;
        const document_id: number = req.body.document_id as number;

        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.session.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;

            await connection.execute(
                "UPDATE documents SET document_name = ?, document_body = ? WHERE user_id = ? AND document_id = ?",
                [name, body, user_id, document_id]
            );
            res.json("Save Document");
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async DeleteDocument(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();
        const document_id: number = req.body.document_id as number;
        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.session.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;

            await connection.execute(
                "DELETE FROM documents WHERE user_id = ? AND document_id = ?",
                [user_id, document_id]
            );

            res.json("Delete Document");
        } catch (error) {
            let message: string = getErrorMessage(error);
            console.error("Database error ", message);
            res.status(500).json({ error: message });
        }
    }

    static async GetDocuments(req: Request, res: Response, next: NextFunction) {
        const connection = Database.getDatabase().getConnection();
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
        const connection = Database.getDatabase().getConnection();
        const document_id: number = req.body.document_id as number;

        try {
            const [result, fields] = await connection.execute(
                "SELECT user_id FROM users WHERE username = ?",
                [req.session.user]
            );
            const user_id: number = (<RowDataPacket[]>result)[0].user_id;

            const [document, dFields] = await connection.execute(
                "SELECT document_name, document_body FROM documents WHERE user_id = ? AND document_id = ?",
                [user_id, document_id]
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
