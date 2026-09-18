import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        teamMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        clientName: {
            type: String,
            required: true,
            trim: true
        },

        internalDepartment: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending"
        },

        budget: {
            type: Number,
            required: true,
            min: 0
        },

        startingDate: {
            type: Date,
            required: true
        },

        endingDate: {
            type: Date,
            required: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;