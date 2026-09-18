import express from "express";
import { createEmployee } from "../controllers/employeeC.js";
import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();

router.post("/create", auth, adminOnly, createEmployee);

export default router;