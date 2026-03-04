import express from "express";
import * as auth from "##/controllers/auth";
import * as validator from "##/validators/user";

const router = express.Router();

router.post("/register", validator.register, auth.register);

router.post("/login", validator.login, auth.login);

router.get("/logout", auth.logout);

router.get("/refresh-token", auth.refresh);

router.get("/sign-token", auth.sign);

router.post("/verify-email", auth.verify);

router.post("/send-email", auth.send);

export default router;