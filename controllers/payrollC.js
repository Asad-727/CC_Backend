import Payroll from "../models/payrollM.js";
import User from "../models/loginM.js";

// Generate Payroll
export const generatePayroll = async (req, res) => {
    try {
        const {
            month,
            year,
            allowance = 0,
            bonus = 0,
            deduction = 0
        } = req.body;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month and year are required"
            });
        }

        if (month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: "Month must be between 1 and 12"
            });
        }

        const employees = await User.find({
            role: "employee"
        });

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No employees found"
            });
        }

        const payrollRecords = [];

        for (const employee of employees) {
            const existingPayroll = await Payroll.findOne({
                employee: employee._id,
                month,
                year
            });

            if (existingPayroll) {
                continue;
            }

            const basicSalary = employee.basicSalary || 0;

            const netSalary =
                Number(basicSalary) +
                Number(allowance) +
                Number(bonus) -
                Number(deduction);

            const payroll = await Payroll.create({
                employee: employee._id,
                month,
                year,
                basicSalary,
                allowance,
                bonus,
                deduction,
                netSalary,
                status: "Pending"
            });

            payrollRecords.push(payroll);
        }

        const populatedPayroll = await Payroll.find({
            month,
            year
        }).populate(
            "employee",
            "username email role"
        );

        return res.status(201).json({
            success: true,
            message:
                payrollRecords.length > 0
                    ? "Payroll generated successfully"
                    : "Payroll already exists for this month and year",
            count: payrollRecords.length,
            payroll: populatedPayroll
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate payroll",
            error: error.message
        });
    }
};

// Get All Payroll
export const getAllPayroll = async (req, res) => {
    try {
        const {
            search,
            month,
            year,
            status
        } = req.query;

        const filter = {};

        if (month) {
            filter.month = Number(month);
        }

        if (year) {
            filter.year = Number(year);
        }

        if (status) {
            filter.status = status;
        }

        let payroll = await Payroll.find(filter)
            .populate(
                "employee",
                "username email role"
            )
            .sort({ createdAt: -1 });

        if (search) {
            const searchText = search.toLowerCase();

            payroll = payroll.filter((item) =>
                item.employee?.username
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }

        return res.status(200).json({
            success: true,
            count: payroll.length,
            payroll
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get payroll",
            error: error.message
        });
    }
};

// Get Payroll Summary
export const getPayrollSummary = async (req, res) => {
    try {
        const { month, year } = req.query;

        const filter = {};

        if (month) {
            filter.month = Number(month);
        }

        if (year) {
            filter.year = Number(year);
        }

        const payroll = await Payroll.find(filter);

        let totalPayroll = 0;
        let paid = 0;
        let pending = 0;

        payroll.forEach((item) => {
            totalPayroll += item.netSalary;

            if (item.status === "Paid") {
                paid += item.netSalary;
            }

            if (
                item.status === "Pending" ||
                item.status === "Processing"
            ) {
                pending += item.netSalary;
            }
        });

        return res.status(200).json({
            success: true,
            summary: {
                totalPayroll,
                paid,
                pending
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get payroll summary",
            error: error.message
        });
    }
};

// Get Single Payroll Details
export const getPayrollById = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id)
            .populate(
                "employee",
                "username email role"
            );

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        return res.status(200).json({
            success: true,
            payroll
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get payroll details",
            error: error.message
        });
    }
};

// Mark Payroll as Paid
export const markPayrollPaid = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        payroll.status = "Paid";
        payroll.paidAt = new Date();

        await payroll.save();

        const updatedPayroll = await Payroll.findById(payroll._id)
            .populate(
                "employee",
                "username email role"
            );

        return res.status(200).json({
            success: true,
            message: "Payroll marked as paid",
            payroll: updatedPayroll
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to mark payroll as paid",
            error: error.message
        });
    }
};

// Export Payroll as CSV
export const exportPayroll = async (req, res) => {
    try {
        const { month, year } = req.query;

        const filter = {};

        if (month) {
            filter.month = Number(month);
        }

        if (year) {
            filter.year = Number(year);
        }

        const payroll = await Payroll.find(filter)
            .populate(
                "employee",
                "username email role"
            )
            .sort({ createdAt: -1 });

        let csv =
            "Employee,Email,Month,Year,Basic Salary,Allowance,Bonus,Deduction,Net Salary,Status,Paid Date\n";

        payroll.forEach((item) => {
            const employeeName =
                item.employee?.username || "";

            const email =
                item.employee?.email || "";

            const paidDate = item.paidAt
                ? new Date(item.paidAt).toISOString().split("T")[0]
                : "";

            csv +=
                `"${employeeName}",` +
                `"${email}",` +
                `${item.month},` +
                `${item.year},` +
                `${item.basicSalary},` +
                `${item.allowance},` +
                `${item.bonus},` +
                `${item.deduction},` +
                `${item.netSalary},` +
                `"${item.status}",` +
                `"${paidDate}"\n`;
        });

        res.setHeader(
            "Content-Type",
            "text/csv"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=payroll-${year || "all"}-${month || "all"}.csv`
        );

        return res.status(200).send(csv);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to export payroll",
            error: error.message
        });
    }
};