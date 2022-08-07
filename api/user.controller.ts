import { Request, Response, NextFunction } from "express";

export default class UserController {
    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const user: string = req.body.user as string;
        const password: string = req.body.password as string;

        console.log(`user: ${user}, password: ${password}`);

        res.json({ msg: "sign up" });
    }
}
