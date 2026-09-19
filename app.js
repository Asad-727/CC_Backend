import express from "express";
import cors from "cors";

import adminSetupR from "./routes/adminSetupR.js";

import loginRouter from "./routes/loginR.js";
import  dashboardRouter from "./routes/dashboardR.js";
import leaveR from "./routes/leaveR.js";
import taskR from "./routes/taskR.js";
import attendanceR from "./routes/attendanceR.js";
import chatR from "./routes/chatR.js";
import employeeRoutes from "./routes/employeeR.js"
import projectR from "./routes/projectR.js";
import payrollR from "./routes/payrollR.js";
import reportR from "./routes/reportR.js";



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.json({
        message: "Coded Clouds Backend is running"
    });
});

// for first time admin create
app.use("/api/admin-setup", adminSetupR);


app.use("/api/auth", loginRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/leave", leaveR);
app.use("/api/tasks", taskR);
app.use("/api/attendance", attendanceR);
app.use("/api/chat", chatR);
app.use("/api/employees", employeeRoutes);
app.use("/api/projects", projectR);
app.use("/api/payroll", payrollR);
app.use("/api/reports", reportR);

export default app;