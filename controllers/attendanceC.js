import Attendance from "../models/attendanceM.js";
import * as XLSX from "xlsx";



// HELPER FUNCTIONS


const getDayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
};


const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) {
        return 0;
    }

    const difference =
        new Date(checkOut).getTime() -
        new Date(checkIn).getTime();

    return Number(
        (difference / (1000 * 60 * 60)).toFixed(2)
    );
};



// CHECK IN


const checkIn = async (req, res) => {
    try {
        const { start, end } = getDayRange();

        const existingAttendance = await Attendance.findOne({
            employee: req.user._id,
            date: {
                $gte: start,
                $lt: end
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: "Attendance has already been marked for today"
            });
        }

        const attendance = await Attendance.create({
            employee: req.user._id,
            date: new Date(),
            checkIn: new Date(),
            status: "Present",
            hours: 0
        });

        res.status(201).json({
            success: true,
            message: "Check-in completed successfully",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to complete check-in",
            error: error.message
        });
    }
};



// CHECK OUT 

const checkOut = async (req, res) => {
    try {
        const { start, end } = getDayRange();

        const attendance = await Attendance.findOne({
            employee: req.user._id,
            date: {
                $gte: start,
                $lt: end
            }
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Check-in record not found for today"
            });
        }

        if (!attendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: "Please check in before checking out"
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: "Check-out has already been completed"
            });
        }

        attendance.checkOut = new Date();

        attendance.hours = calculateHours(
            attendance.checkIn,
            attendance.checkOut
        );

        await attendance.save();

        res.status(200).json({
            success: true,
            message: "Check-out completed successfully",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to complete check-out",
            error: error.message
        });
    }
};



// GET MY ATTENDANCE 

const getMyAttendance = async (req, res) => {
    try {
        const { year, month } = req.query;

        const currentYear =
            Number(year) || new Date().getFullYear();

        const currentMonth =
            month !== undefined
                ? Number(month)
                : new Date().getMonth() + 1;

        const startDate = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        const endDate = new Date(
            currentYear,
            currentMonth,
            1
        );

        const attendance = await Attendance.find({
            employee: req.user._id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        })
        .sort({ date: 1 });

        res.status(200).json({
            success: true,
            message: "Attendance retrieved successfully",
            year: currentYear,
            month: currentMonth,
            count: attendance.length,
            attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve attendance",
            error: error.message
        });
    }
};



// ATTENDANCE SUMMARY 

const getAttendanceSummary = async (req, res) => {
    try {
        const { year, month } = req.query;

        const currentYear =
            Number(year) || new Date().getFullYear();

        const currentMonth =
            month !== undefined
                ? Number(month)
                : new Date().getMonth() + 1;

        const startDate = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        const endDate = new Date(
            currentYear,
            currentMonth,
            1
        );

        const attendance = await Attendance.find({
            employee: req.user._id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });

        let presentDays = 0;
        let absentDays = 0;
        let leaveDays = 0;
        let lateDays = 0;
        let totalHours = 0;

        attendance.forEach((record) => {
            if (record.status === "Present") {
                presentDays++;
            }

            if (record.status === "Absent") {
                absentDays++;
            }

            if (record.status === "Leave") {
                leaveDays++;
            }

            if (record.status === "Late") {
                lateDays++;
            }

            totalHours += Number(record.hours || 0);
        });

        res.status(200).json({
            success: true,
            message: "Attendance summary retrieved successfully",
            summary: {
                presentDays,
                absentDays,
                leaveDays,
                lateDays,
                totalHours: Number(totalHours.toFixed(2))
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve attendance summary",
            error: error.message
        });
    }
};



// ATTENDANCE CALENDAR 

const getAttendanceCalendar = async (req, res) => {
    try {
        const { year, month } = req.query;

        const currentYear =
            Number(year) || new Date().getFullYear();

        const currentMonth =
            month !== undefined
                ? Number(month)
                : new Date().getMonth() + 1;

        const startDate = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        const endDate = new Date(
            currentYear,
            currentMonth,
            1
        );

        const attendance = await Attendance.find({
            employee: req.user._id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        })
        .sort({ date: 1 });

        const calendar = attendance.map((record) => ({
            date: record.date,
            status: record.status,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            hours: record.hours
        }));

        res.status(200).json({
            success: true,
            message: "Attendance calendar retrieved successfully",
            year: currentYear,
            month: currentMonth,
            calendar
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve attendance calendar",
            error: error.message
        });
    }
};



// DAILY DETAILS LOG 

const getDailyDetails = async (req, res) => {
    try {
        const { year, month } = req.query;

        const currentYear =
            Number(year) || new Date().getFullYear();

        const currentMonth =
            month !== undefined
                ? Number(month)
                : new Date().getMonth() + 1;

        const startDate = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        const endDate = new Date(
            currentYear,
            currentMonth,
            1
        );

        const attendance = await Attendance.find({
            employee: req.user._id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        })
        .sort({ date: 1 });

        const dailyDetails = attendance.map((record) => ({
            date: record.date,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            hours: record.hours,
            status: record.status
        }));

        res.status(200).json({
            success: true,
            message: "Daily attendance details retrieved successfully",
            dailyDetails
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve daily attendance details",
            error: error.message
        });
    }
};



// EXPORT ATTENDANCE TO EXCEL 

const exportAttendance = async (req, res) => {
    try {
        const { year, month } = req.query;

        const currentYear =
            Number(year) || new Date().getFullYear();

        const currentMonth =
            month !== undefined
                ? Number(month)
                : new Date().getMonth() + 1;

        const startDate = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        const endDate = new Date(
            currentYear,
            currentMonth,
            1
        );

        const attendance = await Attendance.find({
            employee: req.user._id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        })
        .populate("employee", "username email")
        .sort({ date: 1 });

        const excelData = attendance.map((record) => ({
            Date: record.date
                ? new Date(record.date).toLocaleDateString()
                : "",

            "Check In": record.checkIn
                ? new Date(record.checkIn).toLocaleTimeString()
                : "",

            "Check Out": record.checkOut
                ? new Date(record.checkOut).toLocaleTimeString()
                : "",

            Hours: record.hours || 0,

            Status: record.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(
            excelData
        );

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Attendance"
        );

        const excelBuffer = XLSX.write(
            workbook,
            {
                type: "buffer",
                bookType: "xlsx"
            }
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=attendance-${currentYear}-${currentMonth}.xlsx`
        );

        res.send(excelBuffer);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to export attendance",
            error: error.message
        });
    }
};



// ADMIN - GET ALL ATTENDANCE 

const getAllAttendance = async (req, res) => {
    try {
        const { employee, status, date } = req.query;

        const filter = {};

        if (employee) {
            filter.employee = employee;
        }

        if (status) {
            filter.status = status;
        }

        if (date) {
            const selectedDate = new Date(date);

            const startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            filter.date = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const attendance = await Attendance.find(filter)
            .populate("employee", "username email role")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            message: "All attendance records retrieved successfully",
            count: attendance.length,
            attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve attendance records",
            error: error.message
        });
    }
};


export {
    checkIn,
    checkOut,
    getMyAttendance,
    getAttendanceSummary,
    getAttendanceCalendar,
    getDailyDetails,
    exportAttendance,
    getAllAttendance
};