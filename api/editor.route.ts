import express, { Router } from "express";
import UserController from "./user.controller";

const router: Router = express.Router();

router.route("/").get((req, res) => {
    res.json({ msg: "hola mundo" });
});

router.route("/login").post((req, res) => {
    res.json({ msg: "login" });
});

router.route("/signup").post(UserController.SignUp);

router.route("/logout").get((req, res) => {
    res.json({ msg: "logout" });
});

export default router;
