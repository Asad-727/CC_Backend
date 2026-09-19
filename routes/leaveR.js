 
import express from "express";

import {
    applyLeave,
    getMyLeaves,
    getMyLeaveCounts,
    cancelLeave,
    getAllLeaves,
    getLeaveCounts,
    approveLeave,
    rejectLeave,
    exportLeaves
} from "../controllers/leaveC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();


//  EMPLOYEE 

// Apply Leave
router.post(
    "/apply",
    auth,
    applyLeave
);

// Get My Leaves
router.get(
    "/my",
    auth,
    getMyLeaves
);

// Get My Leave Counts
router.get(
    "/my/counts",
    auth,
    getMyLeaveCounts
);

// Cancel Pending Leave
router.delete(
    "/my/:id",
    auth,
    cancelLeave
);


// ADMIN 

// Get All Employee Leaves
router.get(
    "/all",
    auth,
    adminOnly,
    getAllLeaves
);

// Get Pending / Approved / Rejected Counts
router.get(
    "/counts",
    auth,
    adminOnly,
    getLeaveCounts
);

// Approve Leave
router.put(
    "/:id/approve",
    auth,
    adminOnly,
    approveLeave
);

// Reject Leave
router.put(
    "/:id/reject",
    auth,
    adminOnly,
    rejectLeave
);

// Export Leave CSV
router.get(
    "/export",
    auth,
    adminOnly,
    exportLeaves
);


export default router;