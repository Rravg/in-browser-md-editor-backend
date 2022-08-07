import express, { Express, Request, Response } from "express";
import cors from "cors";
import router from "./api/editor.route";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/editor", router);
app.use("*", (req: Request, res: Response) => {
    res.status(404).json({ error: "page not found" });
});

export default app;
