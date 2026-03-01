import express from "express";
import * as controller from "@/controllers/assignments/staff.js";
import { adminAuthHandler, userAuthHandler } from "@/utils/middleware.js";
import * as validator from "@/validators/assignment.js";

const router = express.Router();

router.post("/:staffId/:shiftId", adminAuthHandler, controller.assignShift);

router.delete("/:staffId/:shiftId", adminAuthHandler, controller.unassignShift);

router.use(userAuthHandler);
router.get("/:staffId", controller.getShifts);

router.get("/:staffId/:shiftId", controller.getShift);

router.put("/:staffId/:shiftId", validator.update, controller.updateShift);

export default router;