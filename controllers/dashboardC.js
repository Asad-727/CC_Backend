import User from "../models/loginM.js";
import Project from "../models/projectM.js";
import Task from "../models/taskM.js";
import Attendance from "../models/attendanceM.js";
import Leave from "../models/leaveM.js";



// ADMIN DASHBOARD 

const getAdminDashboard = async (req, res) => {
    try {
        // Top 4 Boxes
        const totalEmployees = await User.countDocuments({
            role: "employee"
        });

        const activeProjects = await Project.countDocuments({
            status: "Active"
        });

        const totalTasks = await Task.countDocuments();

        const completedTasks = await Task.countDocuments({
            status: "Completed"
        });

        const taskEfficiency = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;


        // Today's Attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await Attendance.countDocuments({
            date: {
                $gte: today,
                $lt: tomorrow
            },
            status: "Present"
        });


        // Employee Department
        const designer = await User.countDocuments({
            role: "employee",
            department: "Design"
        });

        const engineer = await User.countDocuments({
            role: "employee",
            department: "Engineering"
        });

        const sales = await User.countDocuments({
            role: "employee",
            department: "Sales"
        });

        const marketing = await User.countDocuments({
            role: "employee",
            department: "Marketing"
        });


        // Active Board - Leave Requests Only
        const leaveRequests = await Leave.find({
            status: "Pending"
        })
        .populate("employee", "username email")
        .sort({ createdAt: -1 })
        .limit(5);


        res.status(200).json({
            success: true,
            message: "Admin dashboard data retrieved successfully",

            dashboard: {

                topBoxes: {
                    totalEmployees,
                    activeProjects,
                    taskEfficiency,
                    todayAttendance
                },

                employeeDepartment: {
                    totalEmployees,
                    designer,
                    engineer,
                    sales,
                    marketing
                },

                activeBoard: {
                    leaveRequests
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve admin dashboard data",
            error: error.message
        });
    }
};



// EMPLOYEE DASHBOARD 

const getEmployeeDashboard = async (req, res) => {
    try {
        const employeeId = req.user._id;


        // Today's Date
        const today = new Date();


        // Today's Attendance
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayAttendance = await Attendance.findOne({
            employee: employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });


        // My Urgent Tasks
        const urgentTasks = await Task.find({
            assignedTo: employeeId,
            priority: {
                $in: ["High", "Critical"]
            },
            status: {
                $ne: "Completed"
            }
        })
        .populate("project", "name")
        .sort({ deadline: 1 })
        .limit(5);


        // Recent Leave Requests
        const myLeave = await Leave.find({
            employee: employeeId
        })
        .sort({ createdAt: -1 })
        .limit(5);


        res.status(200).json({
            success: true,
            message: "Employee dashboard data retrieved successfully",

            dashboard: {

                today: {
                    date: today
                },

                attendance: {
                    date: todayAttendance
                        ? todayAttendance.date
                        : null,

                    checkIn: todayAttendance
                        ? todayAttendance.checkIn
                        : null,

                    status: todayAttendance
                        ? todayAttendance.status
                        : null
                },

                myUrgentTasks: urgentTasks,

                announcements: [],

                quickActions: {
                    applyLeave: "/api/leave/apply",
                    startChat: "/api/chat",
                    updateTask: "/api/tasks/my"
                },

                myLeave: myLeave
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve employee dashboard data",
            error: error.message
        });
    }
};


export {
    getAdminDashboard,
    getEmployeeDashboard
};