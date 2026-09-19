 
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        leaveType: {
            type: String,
            required: true,
            trim: true
        },

        totalDays: {
            type: Number,
            required: true,
            min: 1
        },

        fromDate: {
            type: Date,
            required: true
        },

        toDate: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },

        appliedDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;