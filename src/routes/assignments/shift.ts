import express from "express";
import * as controller from "@/controllers/assignments/shift.js";
import { adminAuthHandler, userAuthHandler } from "@/utils/middleware.js";
import * as validator from "@/validators/assignment.js";

const router = express.Router();

router.post("/:shiftId/:staffId", adminAuthHandler, controller.assignStaff);

router.delete("/:shiftId/:staffId", adminAuthHandler, controller.unassignStaff);

router.use(userAuthHandler);
router.get("/:shiftId", controller.getStaffs);

router.get("/:shiftId/:staffId", controller.getStaff);

router.put("/:shiftId/:staffId", validator.update, controller.updateStaff);

export default router;