import express from "express"
import { logout } from "@/controllers/auth.js";
import * as user from "@/controllers/user.js";
import { adminAuthHandler, userAuthHandler } from "@/utils/middleware.js";
import * as validator from "@/validators/user.js";

const router = express.Router();

router.post("/", validator.create, adminAuthHandler, user.create);

router.get("/", adminAuthHandler, user.findAll);

router.use(userAuthHandler);

router.put("/:id", userAuthHandler, user.update);

router.get("/:id", user.findOne);

router.delete("/:id", user.destroy, logout);

export default router;