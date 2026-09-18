import express from "express";

import {
    generatePayroll,
    getAllPayroll,
    getPayrollSummary,
    getPayrollById,
    markPayrollPaid,
    exportPayroll
} from "../controllers/payrollC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();

// Generate Payroll
router.post(
    "/generate",
    auth,
    adminOnly,
    generatePayroll
);

// Get All Payroll
router.get(
    "/all",
    auth,
    adminOnly,
    getAllPayroll
);

// Get Payroll Summary
router.get(
    "/summary",
    auth,
    adminOnly,
    getPayrollSummary
);

// Export Payroll CSV
router.get(
    "/export",
    auth,
    adminOnly,
    exportPayroll
);

// Get Payroll Details
router.get(
    "/:id",
    auth,
    adminOnly,
    getPayrollById
);

// Mark Payroll Paid
router.put(
    "/:id/pay",
    auth,
    adminOnly,
    markPayrollPaid
);

export default router;