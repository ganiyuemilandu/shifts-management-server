import express from "express"
import { logout } from "##/controllers/auth";
import * as user from "##/controllers/user";
import { adminAuthHandler, userAuthHandler } from "##/utils/middleware";
import * as validator from "##/validators/user";

const router = express.Router();

router.post("/", validator.create, adminAuthHandler, user.create);

router.get("/", adminAuthHandler, user.findAll);

router.use(userAuthHandler);

router.put("/:id", userAuthHandler, user.update);

router.get("/:id", user.findOne);

router.delete("/:id", user.destroy, logout);

export default router;