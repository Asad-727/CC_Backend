import express from "express";
import { createInitialAdmin } from "../controllers/adminSetupC.js";

const router = express.Router();

router.post("/", createInitialAdmin);

export default router;