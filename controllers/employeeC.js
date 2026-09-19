import Employee from "../models/employeeM.js"; 
import User from "../models/loginM.js"; 
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

    // Check username in User collection
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }

    // Check username in Employee collection
    const existingEmployeeUsername = await Employee.findOne({ username });

    if (existingEmployeeUsername) {
      return res.status(400).json({
        success: false,
        message: "Employee username already exists"
      });
    }

    // Check email in Employee collection
    const existingEmployeeEmail = await Employee.findOne({ email });

    if (existingEmployeeEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create login User
    const user = await User.create({
      username,
      password: hashedPassword,
      role: "employee"
    });

    try {
      // Create Employee and connect it with User
      const employee = await Employee.create({
        user: user._id,
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
    } catch (employeeError) {
      // If Employee creation fails, remove created User
      await User.findByIdAndDelete(user._id);

      throw employeeError;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message
    });
  }
};