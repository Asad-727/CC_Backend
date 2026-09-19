import User from "../models/loginM.js";
import Task from "../models/taskM.js";
import Payroll from "../models/payrollM.js";
import Attendance from "../models/attendanceM.js";
import Leave from "../models/leaveM.js";
import XLSX from "xlsx";

// Get date range
const getDateRange = (period, startDate, endDate) => {
    const now = new Date();

    if (period === "thisMonth") {
        return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        };
    }

    if (period === "lastMonth") {
        return {
            start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        };
    }

    if (period === "thisYear") {
        return {
            start: new Date(now.getFullYear(), 0, 1),
            end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        };
    }

    if (period === "custom" && startDate && endDate) {
        return {
            start: new Date(startDate),
            end: new Date(`${endDate}T23:59:59.999`)
        };
    }

    return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    };
};


// Workforce Report
export const getWorkforceReport = async (req, res) => {
    try {
        const totalWorkers = await User.countDocuments({
            role: "employee"
        });

        const activeWorkers = await User.countDocuments({
            role: "employee",
            status: { $ne: "Suspended" }
        });

        const suspendedWorkers = await User.countDocuments({
            role: "employee",
            status: "Suspended"
        });

        return res.status(200).json({
            success: true,
            report: {
                totalWorkers,
                activeWorkers,
                suspendedWorkers
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate workforce report",
            error: error.message
        });
    }
};


// Productivity & Tasks Report
export const getProductivityReport = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();

        const completedTasks = await Task.countDocuments({
            status: "Completed"
        });

        const overdueTasks = await Task.countDocuments({
            deadline: { $lt: new Date() },
            status: { $ne: "Completed" }
        });

        const completedRate = totalTasks === 0
            ? 0
            : Number(((completedTasks / totalTasks) * 100).toFixed(2));

        return res.status(200).json({
            success: true,
            report: {
                totalTasks,
                completedTasks,
                overdueTasks,
                completedRate
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate productivity report",
            error: error.message
        });
    }
};


// Payroll & Corporate Runway Report
export const getPayrollReport = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const { start, end } = getDateRange(
            period,
            startDate,
            endDate
        );

        const payroll = await Payroll.find({
            createdAt: {
                $gte: start,
                $lte: end
            }
        });

        let totalPayroll = 0;
        let bonusPaid = 0;
        let deduction = 0;

        payroll.forEach((item) => {
            totalPayroll += item.netSalary || 0;
            bonusPaid += item.bonus || 0;
            deduction += item.deduction || 0;
        });

        return res.status(200).json({
            success: true,
            report: {
                totalPayroll,
                bonusPaid,
                deduction,
                records: payroll.length
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate payroll report",
            error: error.message
        });
    }
};


// Attendance & Engagement Report
export const getAttendanceReport = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const { start, end } = getDateRange(
            period,
            startDate,
            endDate
        );

        const attendance = await Attendance.find({
            date: {
                $gte: start,
                $lte: end
            }
        }).populate(
            "employee",
            "username"
        );

        const totalRecords = attendance.length;

        const presentRecords = attendance.filter(
            item => item.status === "Present"
        ).length;

        const lateRecords = attendance.filter(
            item => item.status === "Late"
        ).length;

        const totalHours = attendance.reduce(
            (total, item) => total + (item.hours || 0),
            0
        );

        const averageAttendance = totalRecords === 0
            ? 0
            : Number(((presentRecords / totalRecords) * 100).toFixed(2));

        const lateRatio = totalRecords === 0
            ? 0
            : Number(((lateRecords / totalRecords) * 100).toFixed(2));

        const leaveUsage = await Leave.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end
            },
            status: "Approved"
        });

        // Employee engagement
        const engagementMap = {};

        attendance.forEach((item) => {
            if (!item.employee) return;

            const employeeId = item.employee._id.toString();
            const username = item.employee.username;

            if (!engagementMap[employeeId]) {
                engagementMap[employeeId] = {
                    employeeName: username,
                    total: 0,
                    present: 0
                };
            }

            engagementMap[employeeId].total++;

            if (
                item.status === "Present" ||
                item.status === "Late"
            ) {
                engagementMap[employeeId].present++;
            }
        });

        const topEngagedEmployees = Object.values(
            engagementMap
        )
            .map((employee) => ({
                employeeName: employee.employeeName,
                engagementPercentage:
                    employee.total === 0
                        ? 0
                        : Number(
                            (
                                (employee.present / employee.total) *
                                100
                            ).toFixed(2)
                        )
            }))
            .sort(
                (a, b) =>
                    b.engagementPercentage -
                    a.engagementPercentage
            )
            .slice(0, 10);

        return res.status(200).json({
            success: true,
            report: {
                averageAttendance,
                lateRatio,
                leaveUsage,
                totalHours,
                topEngagedEmployees
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate attendance report",
            error: error.message
        });
    }
};


// Complete Reports Dashboard
export const getAllReports = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const { start, end } = getDateRange(
            period,
            startDate,
            endDate
        );

        const totalWorkers = await User.countDocuments({
            role: "employee"
        });

        const activeWorkers = await User.countDocuments({
            role: "employee",
            status: { $ne: "Suspended" }
        });

        const suspendedWorkers = await User.countDocuments({
            role: "employee",
            status: "Suspended"
        });

        const totalTasks = await Task.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end
            }
        });

        const completedTasks = await Task.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end
            },
            status: "Completed"
        });

        const overdueTasks = await Task.countDocuments({
            deadline: { $lt: new Date() },
            status: { $ne: "Completed" }
        });

        const completedRate = totalTasks === 0
            ? 0
            : Number(((completedTasks / totalTasks) * 100).toFixed(2));

        const payroll = await Payroll.find({
            createdAt: {
                $gte: start,
                $lte: end
            }
        });

        let totalPayroll = 0;
        let bonusPaid = 0;
        let deduction = 0;

        payroll.forEach((item) => {
            totalPayroll += item.netSalary || 0;
            bonusPaid += item.bonus || 0;
            deduction += item.deduction || 0;
        });

        const attendance = await Attendance.find({
            date: {
                $gte: start,
                $lte: end
            }
        });

        const totalAttendance = attendance.length;

        const presentAttendance = attendance.filter(
            item =>
                item.status === "Present" ||
                item.status === "Late"
        ).length;

        const lateAttendance = attendance.filter(
            item => item.status === "Late"
        ).length;

        const approvedLeaves = await Leave.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end
            },
            status: "Approved"
        });

        const averageAttendance = totalAttendance === 0
            ? 0
            : Number(
                ((presentAttendance / totalAttendance) * 100).toFixed(2)
            );

        const lateRatio = totalAttendance === 0
            ? 0
            : Number(
                ((lateAttendance / totalAttendance) * 100).toFixed(2)
            );

        return res.status(200).json({
            success: true,
            filters: {
                period: period || "thisMonth",
                startDate: start,
                endDate: end
            },
            reports: {
                workforce: {
                    totalWorkers,
                    activeWorkers,
                    suspendedWorkers
                },
                productivity: {
                    totalTasks,
                    completedTasks,
                    overdueTasks,
                    completedRate
                },
                payroll: {
                    totalPayroll,
                    bonusPaid,
                    deduction
                },
                attendance: {
                    averageAttendance,
                    lateRatio,
                    leaveUsage: approvedLeaves
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate reports",
            error: error.message
        });
    }
};


// Export All Reports to Excel
export const exportAllReports = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const { start, end } = getDateRange(
            period,
            startDate,
            endDate
        );

        const employees = await User.find({
            role: "employee"
        }).select("username email role");

        const tasks = await Task.find({
            createdAt: {
                $gte: start,
                $lte: end
            }
        }).populate(
            "assignedTo",
            "username email"
        );

        const payroll = await Payroll.find({
            createdAt: {
                $gte: start,
                $lte: end
            }
        }).populate(
            "employee",
            "username email"
        );

        const attendance = await Attendance.find({
            date: {
                $gte: start,
                $lte: end
            }
        }).populate(
            "employee",
            "username"
        );

        const employeeSheet = employees.map((employee) => ({
            Employee: employee.username,
            Email: employee.email,
            Role: employee.role
        }));

        const taskSheet = tasks.map((task) => ({
            "Task Title": task.title,
            Employee: task.assignedTo?.username || "",
            Status: task.status,
            Priority: task.priority,
            Deadline: task.deadline
        }));

        const payrollSheet = payroll.map((item) => ({
            Employee: item.employee?.username || "",
            Month: item.month,
            Year: item.year,
            "Basic Salary": item.basicSalary,
            Allowance: item.allowance,
            Bonus: item.bonus,
            Deduction: item.deduction,
            "Net Salary": item.netSalary,
            Status: item.status
        }));

        const attendanceSheet = attendance.map((item) => ({
            Employee: item.employee?.username || "",
            Date: item.date,
            "Check In": item.checkIn,
            "Check Out": item.checkOut,
            Hours: item.hours,
            Status: item.status
        }));

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(employeeSheet),
            "Workforce"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(taskSheet),
            "Productivity"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(payrollSheet),
            "Payroll"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(attendanceSheet),
            "Attendance"
        );

        const buffer = XLSX.write(
            workbook,
            {
                type: "buffer",
                bookType: "xlsx"
            }
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reports.xlsx"
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(buffer);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to export reports",
            error: error.message
        });
    }
};

// Leave Report
export const getLeaveReport = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const { start, end } = getDateRange(
            period,
            startDate,
            endDate
        );

        const leaves = await Leave.find({
            createdAt: {
                $gte: start,
                $lte: end
            }
        }).populate(
            "employee",
            "username"
        );

        const totalLeaves = leaves.length;

        const pendingLeaves = leaves.filter(
            item => item.status === "Pending"
        ).length;

        const approvedLeaves = leaves.filter(
            item => item.status === "Approved"
        ).length;

        const rejectedLeaves = leaves.filter(
            item => item.status === "Rejected"
        ).length;

        const totalLeaveDays = leaves.reduce(
            (total, item) => total + (item.totalDays || 0),
            0
        );

        const approvedLeaveDays = leaves
            .filter(item => item.status === "Approved")
            .reduce(
                (total, item) => total + (item.totalDays || 0),
                0
            );

        return res.status(200).json({
            success: true,
            report: {
                totalLeaves,
                pendingLeaves,
                approvedLeaves,
                rejectedLeaves,
                totalLeaveDays,
                approvedLeaveDays,
                records: leaves.map(item => ({
                    employee: item.employee?.username || "",
                    leaveType: item.leaveType,
                    totalDays: item.totalDays,
                    fromDate: item.fromDate,
                    toDate: item.toDate,
                    reason: item.reason,
                    status: item.status,
                    appliedDate: item.appliedDate
                }))
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate leave report",
            error: error.message
        });
    }
};