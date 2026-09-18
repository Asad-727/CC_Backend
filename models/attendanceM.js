import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["Present", "Absent", "Late", "Leave"],
            required: true
        },

        checkIn: {
            type: String,
            default: null
        },

        checkOut: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;