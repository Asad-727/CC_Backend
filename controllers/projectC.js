import Project from "../models/projectM.js";
import User from "../models/loginM.js";

// Create Project
export const createProject = async (req, res) => {
    try {
        const {
            name,
            teamMembers,
            clientName,
            internalDepartment,
            status,
            budget,
            startingDate,
            endingDate,
            description,
            progress
        } = req.body;

        if (
            !name ||
            !teamMembers ||
            !clientName ||
            !internalDepartment ||
            !budget ||
            !startingDate ||
            !endingDate ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message: "All required project fields are required"
            });
        }

        if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one team member is required"
            });
        }

        const members = await User.find({
            _id: { $in: teamMembers }
        });

        if (members.length !== teamMembers.length) {
            return res.status(404).json({
                success: false,
                message: "One or more team members were not found"
            });
        }

        if (new Date(endingDate) < new Date(startingDate)) {
            return res.status(400).json({
                success: false,
                message: "Ending date cannot be before starting date"
            });
        }

        const project = await Project.create({
            name,
            teamMembers,
            clientName,
            internalDepartment,
            status: status || "Pending",
            budget,
            startingDate,
            endingDate,
            description,
            progress: progress || 0
        });

        const populatedProject = await Project.findById(project._id)
            .populate("teamMembers", "username email role");

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project: populatedProject
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message
        });
    }
};

// Get All Projects
export const getAllProjects = async (req, res) => {
    try {
        const { search, status } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { clientName: { $regex: search, $options: "i" } },
                { internalDepartment: { $regex: search, $options: "i" } }
            ];
        }

        if (status) {
            filter.status = status;
        }

        const projects = await Project.find(filter)
            .populate("teamMembers", "username email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get projects",
            error: error.message
        });
    }
};

// Get Project Counts
export const getProjectCounts = async (req, res) => {
    try {
        const [pending, inProgress, completed] = await Promise.all([
            Project.countDocuments({ status: "Pending" }),
            Project.countDocuments({ status: "In Progress" }),
            Project.countDocuments({ status: "Completed" })
        ]);

        return res.status(200).json({
            success: true,
            counts: {
                pending,
                inProgress,
                completed
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get project counts",
            error: error.message
        });
    }
};

// Get Single Project Details
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("teamMembers", "username email role");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get project details",
            error: error.message
        });
    }
};

// Update Project
export const updateProject = async (req, res) => {
    try {
        const {
            name,
            teamMembers,
            clientName,
            internalDepartment,
            status,
            budget,
            startingDate,
            endingDate,
            description,
            progress
        } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (startingDate && endingDate) {
            if (new Date(endingDate) < new Date(startingDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Ending date cannot be before starting date"
                });
            }
        }

        if (teamMembers) {
            if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one team member is required"
                });
            }

            const members = await User.find({
                _id: { $in: teamMembers }
            });

            if (members.length !== teamMembers.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more team members were not found"
                });
            }

            project.teamMembers = teamMembers;
        }

        if (name !== undefined) project.name = name;
        if (clientName !== undefined) project.clientName = clientName;
        if (internalDepartment !== undefined) {
            project.internalDepartment = internalDepartment;
        }
        if (status !== undefined) project.status = status;
        if (budget !== undefined) project.budget = budget;
        if (startingDate !== undefined) project.startingDate = startingDate;
        if (endingDate !== undefined) project.endingDate = endingDate;
        if (description !== undefined) project.description = description;
        if (progress !== undefined) project.progress = progress;

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("teamMembers", "username email role");

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project: updatedProject
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update project",
            error: error.message
        });
    }
};

// Delete Project
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        await Project.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete project",
            error: error.message
        });
    }
};