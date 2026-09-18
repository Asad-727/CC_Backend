import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },

        year: {
            type: Number,
            required: true
        },

        basicSalary: {
            type: Number,
            required: true,
            min: 0
        },

        allowance: {
            type: Number,
            default: 0,
            min: 0
        },

        bonus: {
            type: Number,
            default: 0,
            min: 0
        },

        deduction: {
            type: Number,
            default: 0,
            min: 0
        },

        netSalary: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["Pending", "Processing", "Paid"],
            default: "Pending"
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

payrollSchema.index(
    { employee: 1, month: 1, year: 1 },
    { unique: true }
);

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;