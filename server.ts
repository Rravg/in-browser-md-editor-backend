import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./api/editor.route";
import session from "express-session";

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: "session secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use("/api/v1/editor", router);
app.use("*", (req: Request, res: Response) => {
    res.status(404).json({ error: "page not found" });
});

export default app;
