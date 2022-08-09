import express, { Router } from "express";
import UserController from "./user.controller";
import DocumentController from "./document.controller";

const router: Router = express.Router();

router.route("/login").post(UserController.Login);
router.route("/signup").post(UserController.SignUp);
router.route("/logout").get(UserController.Logout);

router.route("/").get(DocumentController.GetDocuments);
router.route("/document").get(DocumentController.GetDocument);
router.route("/create").post(DocumentController.CreateDocument);
router.route("/save").put(DocumentController.SaveDocument);
router.route("/delete").delete(DocumentController.DeleteDocument);

export default router;
