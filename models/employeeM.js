import mongoose from "mongoose"; 

const employeeSchema = new mongoose.Schema(
  {
    // Login User connection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // Section 1: Basic Information
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // Section 2: Organization Details
    role: {
      type: String,
      enum: [
        "Developer",
        "Frontend",
        "Backend",
        "HR",
        "Admin",
        "Marketing",
        "Sales",
        "Social Media"
      ],
      required: true
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    designation: {
      type: String,
      required: true,
      trim: true
    },

    joiningDate: {
      type: Date,
      required: true
    },

    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },

    // Section 3: Optional Documents
    cvResume: {
      type: String,
      default: null
    },

    experienceLetter: {
      type: String,
      default: null
    },

    idCardFront: {
      type: String,
      default: null
    },

    idCardBack: {
      type: String,
      default: null
    },

    offerLetter: {
      type: String,
      default: null
    },

    signedContract: {
      type: String,
      default: null
    },

    // Employee Status
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;