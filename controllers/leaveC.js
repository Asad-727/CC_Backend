// controllers/leaveC.js

import Leave from "../models/leaveM.js";
import User from "../models/loginM.js";


// ==================== EMPLOYEE ====================

// Apply Leave
export const applyLeave = async (req, res) => {
    try {
        const {
            leaveType,
            totalDays,
            fromDate,
            toDate,
            reason
        } = req.body;

        if (
            !leaveType ||
            !totalDays ||
            !fromDate ||
            !toDate ||
            !reason
        ) {
            return res.status(400).json({
                success: false,
                message: "All leave fields are required"
            });
        }

        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: "To date cannot be before from date"
            });
        }

        const leave = await Leave.create({
            employee: req.user._id,
            leaveType,
            totalDays,
            fromDate: startDate,
            toDate: endDate,
            reason,
            status: "Pending"
        });

        const populatedLeave = await Leave.findById(leave._id)
            .populate("employee", "username email role");

        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            leave: populatedLeave
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to apply for leave",
            error: error.message
        });
    }
};


// Get My Leaves
export const getMyLeaves = async (req, res) => {
    try {
        const { search, status } = req.query;

        const query = {
            employee: req.user._id
        };

        if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                {
                    leaveType: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    reason: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    status: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const leaves = await Leave.find(query)
            .populate("employee", "username email role")
            .sort({ appliedDate: -1 });

        return res.status(200).json({
            success: true,
            count: leaves.length,
            leaves
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get your leaves",
            error: error.message
        });
    }
};


// My Leave Counts
export const getMyLeaveCounts = async (req, res) => {
    try {
        const [pending, approved, rejected] = await Promise.all([
            Leave.countDocuments({
                employee: req.user._id,
                status: "Pending"
            }),

            Leave.countDocuments({
                employee: req.user._id,
                status: "Approved"
            }),

            Leave.countDocuments({
                employee: req.user._id,
                status: "Rejected"
            })
        ]);

        return res.status(200).json({
            success: true,
            counts: {
                pending,
                approved,
                rejected
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get leave counts",
            error: error.message
        });
    }
};


// Cancel Pending Leave
export const cancelLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findOne({
            _id: id,
            employee: req.user._id
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leave requests can be cancelled"
            });
        }

        await Leave.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Leave request cancelled successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to cancel leave",
            error: error.message
        });
    }
};


// ==================== ADMIN ====================

// Get All Employee Leaves
export const getAllLeaves = async (req, res) => {
    try {
        const { search, status } = req.query;

        const query = {};

        if (
            status &&
            ["Pending", "Approved", "Rejected"].includes(status)
        ) {
            query.status = status;
        }

        let leaves = await Leave.find(query)
            .populate("employee", "username email role")
            .sort({ appliedDate: -1 });

        if (search) {
            const searchText = search.toLowerCase();

            leaves = leaves.filter((leave) => {
                const username =
                    leave.employee?.username?.toLowerCase() || "";

                const email =
                    leave.employee?.email?.toLowerCase() || "";

                const leaveType =
                    leave.leaveType?.toLowerCase() || "";

                const reason =
                    leave.reason?.toLowerCase() || "";

                const leaveStatus =
                    leave.status?.toLowerCase() || "";

                return (
                    username.includes(searchText) ||
                    email.includes(searchText) ||
                    leaveType.includes(searchText) ||
                    reason.includes(searchText) ||
                    leaveStatus.includes(searchText)
                );
            });
        }

        return res.status(200).json({
            success: true,
            count: leaves.length,
            leaves
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get all leaves",
            error: error.message
        });
    }
};


// Admin Leave Counts
export const getLeaveCounts = async (req, res) => {
    try {
        const [pending, approved, rejected] = await Promise.all([
            Leave.countDocuments({
                status: "Pending"
            }),

            Leave.countDocuments({
                status: "Approved"
            }),

            Leave.countDocuments({
                status: "Rejected"
            })
        ]);

        return res.status(200).json({
            success: true,
            counts: {
                pending,
                approved,
                rejected
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get leave counts",
            error: error.message
        });
    }
};


// Approve Leave
export const approveLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be approved"
            });
        }

        leave.status = "Approved";

        await leave.save();

        const updatedLeave = await Leave.findById(id)
            .populate("employee", "username email role");

        return res.status(200).json({
            success: true,
            message: "Leave approved successfully",
            leave: updatedLeave
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to approve leave",
            error: error.message
        });
    }
};


// Reject Leave
export const rejectLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be rejected"
            });
        }

        leave.status = "Rejected";

        await leave.save();

        const updatedLeave = await Leave.findById(id)
            .populate("employee", "username email role");

        return res.status(200).json({
            success: true,
            message: "Leave rejected successfully",
            leave: updatedLeave
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reject leave",
            error: error.message
        });
    }
};


// Export Leaves as CSV
export const exportLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate("employee", "username email role")
            .sort({ appliedDate: -1 });

        let csv = "";

        csv += "Employee,Email,Type,Total Days,From Date,To Date,Reason,Status,Applied Date\n";

        leaves.forEach((leave) => {
            const employee =
                leave.employee?.username || "";

            const email =
                leave.employee?.email || "";

            const type =
                leave.leaveType || "";

            const totalDays =
                leave.totalDays || 0;

            const fromDate =
                new Date(leave.fromDate).toISOString().split("T")[0];

            const toDate =
                new Date(leave.toDate).toISOString().split("T")[0];

            const reason =
                (leave.reason || "").replace(/"/g, '""');

            const status =
                leave.status || "";

            const appliedDate =
                new Date(leave.appliedDate)
                    .toISOString()
                    .split("T")[0];

            csv += `"${employee}","${email}","${type}",${totalDays},"${fromDate}","${toDate}","${reason}","${status}","${appliedDate}"\n`;
        });

        res.setHeader(
            "Content-Type",
            "text/csv"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=leave-report.csv"
        );

        return res.status(200).send(csv);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to export leave data",
            error: error.message
        });
    }
};