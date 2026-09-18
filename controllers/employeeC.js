
import Employee from "../models/employeeM.js";
import bcrypt from "bcryptjs";

export const createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      address,
      phoneNumber,
      password,
      role,
      department,
      designation,
      joiningDate,
      basicSalary
    } = req.body;

    // Check required fields
    if (
      !fullName ||
      !username ||
      !email ||
      !address ||
      !phoneNumber ||
      !password ||
      !role ||
      !department ||
      !designation ||
      !joiningDate ||
      basicSalary === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required"
      });
    }

    // Check existing username
    const existingUsername = await Employee.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }

    // Check existing email
    const existingEmail = await Employee.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const employee = await Employee.create({
      fullName,
      username,
      email,
      address,
      phoneNumber,
      password: hashedPassword,
      role,
      department,
      designation,
      joiningDate,
      basicSalary
    });

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeResponse
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message
    });
  }
};