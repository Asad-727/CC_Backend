import express from "express";

import {
    createProject,
    getAllProjects,
    getProjectCounts,
    getProjectById,
    updateProject,
    deleteProject
} from "../controllers/projectC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();

// Create Project
router.post("/", auth, adminOnly, createProject);

// Get All Projects
router.get("/all", auth, adminOnly, getAllProjects);

// Get Project Counts
router.get("/counts", auth, adminOnly, getProjectCounts);

// Get Single Project
router.get("/:id", auth, adminOnly, getProjectById);

// Update Project
router.put("/:id", auth, adminOnly, updateProject);

// Delete Project
router.delete("/:id", auth, adminOnly, deleteProject);

export default router;