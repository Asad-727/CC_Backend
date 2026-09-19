import express from "express";

import {
    assignTask,
    getAllTasks,
    getAllTaskCounts,
    getMyTasks,
    getMyTaskCounts,
    updateTaskStatus,
    deleteTask
} from "../controllers/taskC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();



// ADMIN TASK ROUTES
// =========================

router.post(
    "/assign",
    auth,
    adminOnly,
    assignTask
);

router.get(
    "/all",
    auth,
    adminOnly,
    getAllTasks
);

router.get(
    "/all/counts",
    auth,
    adminOnly,
    getAllTaskCounts
);

router.delete(
    "/:id",
    auth,
    adminOnly,
    deleteTask
);



// EMPLOYEE TASK ROUTES
// =========================

router.get(
    "/my",
    auth,
    getMyTasks
);

router.get(
    "/my/counts",
    auth,
    getMyTaskCounts
);

router.put(
    "/my/:id/status",
    auth,
    updateTaskStatus
);


export default router;