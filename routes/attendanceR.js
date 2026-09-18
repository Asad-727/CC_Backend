import express from "express";

import {
    checkIn,
    checkOut,
    getMyAttendance,
    getAttendanceSummary,
    getAttendanceCalendar,
    getDailyDetails,
    exportAttendance,
    getAllAttendance
} from "../controllers/attendanceC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();


// =========================
// EMPLOYEE ATTENDANCE
// =========================

// Check In
router.post(
    "/check-in",
    auth,
    checkIn
);

// Check Out
router.post(
    "/check-out",
    auth,
    checkOut
);

// My Attendance
router.get(
    "/my",
    auth,
    getMyAttendance
);

// Monthly Summary
router.get(
    "/my/summary",
    auth,
    getAttendanceSummary
);

// Calendar
router.get(
    "/my/calendar",
    auth,
    getAttendanceCalendar
);

// Daily Details
router.get(
    "/my/daily-details",
    auth,
    getDailyDetails
);

// Export Excel
router.get(
    "/my/export",
    auth,
    exportAttendance
);


// =========================
// ADMIN ATTENDANCE
// =========================

router.get(
    "/all",
    auth,
    adminOnly,
    getAllAttendance
);


export default router;