import express from "express";

import {
    getAdminDashboard,
    getEmployeeDashboard
} from "../controllers/dashboardC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();


// Admin Dashboard
router.get(
    "/admin",
    auth,
    adminOnly,
    getAdminDashboard
);


// Employee Dashboard
router.get(
    "/employee",
    auth,
    getEmployeeDashboard
);


export default router;