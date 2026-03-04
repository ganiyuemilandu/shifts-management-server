import express from "express";
import * as shift from "##/controllers/shift";
import { adminAuthHandler } from "##/utils/middleware";
import * as validator from "##/validators/shift";

const router = express.Router();

router.post("/", validator.create, adminAuthHandler, shift.create);

router.put("/:id", validator.update, adminAuthHandler, shift.update);

router.use(adminAuthHandler);

router.get("/", shift.findAll);

router.get("/:id", shift.findOne);

router.delete("/:id", shift.destroy);

export default router;