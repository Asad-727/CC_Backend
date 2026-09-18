import express from "express";

import {
    getWorkforceReport,
    getProductivityReport,
    getPayrollReport,
    getAttendanceReport,
    getAllReports,
    exportAllReports
} from "../controllers/reportC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();

router.get("/all", auth, adminOnly, getAllReports);

router.get("/workforce", auth, adminOnly, getWorkforceReport);

router.get("/productivity", auth, adminOnly, getProductivityReport);

router.get("/payroll", auth, adminOnly, getPayrollReport);

router.get("/attendance", auth, adminOnly, getAttendanceReport);

router.get("/export", auth, adminOnly, exportAllReports);

export default router;