import Task from "../models/taskM.js";


// =========================
// ASSIGN TASK - ADMIN
// =========================

const assignTask = async (req, res) => {
    try {
        const {
            assignedTo,
            title,
            description,
            project,
            priority,
            deadline
        } = req.body;

        if (
            !assignedTo ||
            !title ||
            !description ||
            !project ||
            !priority ||
            !deadline
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        const task = await Task.create({
            assignedTo,
            title,
            description,
            project,
            priority,
            deadline
        });

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "username email role")
            .populate("project", "name");

        res.status(201).json({
            success: true,
            message: "Task assigned successfully",
            task: populatedTask
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to assign task",
            error: error.message
        });
    }
};


// =========================
// GET ALL TASKS - ADMIN
// =========================

const getAllTasks = async (req, res) => {
    try {
        const { search } = req.query;

        const filter = {};

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        const tasks = await Task.find(filter)
            .populate("assignedTo", "username email role")
            .populate("project", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Tasks retrieved successfully",
            count: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
            error: error.message
        });
    }
};


// =========================
// ADMIN TASK COUNTS
// =========================

const getAllTaskCounts = async (req, res) => {
    try {
        const [
            pending,
            inProcess,
            underReview,
            completed
        ] = await Promise.all([
            Task.countDocuments({ status: "Pending" }),
            Task.countDocuments({ status: "In Process" }),
            Task.countDocuments({ status: "Under Review" }),
            Task.countDocuments({ status: "Completed" })
        ]);

        res.status(200).json({
            success: true,
            message: "Task counts retrieved successfully",
            counts: {
                pending,
                inProcess,
                underReview,
                completed
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve task counts",
            error: error.message
        });
    }
};


// =========================
// MY TASKS - EMPLOYEE
// =========================

const getMyTasks = async (req, res) => {
    try {
        const { search, status } = req.query;

        const filter = {
            assignedTo: req.user._id
        };

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        if (status) {
            filter.status = status;
        }

        const tasks = await Task.find(filter)
            .populate("assignedTo", "username email role")
            .populate("project", "name")
            .sort({ deadline: 1 });

        res.status(200).json({
            success: true,
            message: "My tasks retrieved successfully",
            count: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve my tasks",
            error: error.message
        });
    }
};


// =========================
// MY TASK COUNTS - EMPLOYEE
// =========================

const getMyTaskCounts = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const [
            pending,
            inProcess,
            underReview,
            completed
        ] = await Promise.all([
            Task.countDocuments({
                assignedTo: employeeId,
                status: "Pending"
            }),

            Task.countDocuments({
                assignedTo: employeeId,
                status: "In Process"
            }),

            Task.countDocuments({
                assignedTo: employeeId,
                status: "Under Review"
            }),

            Task.countDocuments({
                assignedTo: employeeId,
                status: "Completed"
            })
        ]);

        res.status(200).json({
            success: true,
            message: "My task counts retrieved successfully",
            counts: {
                pending,
                inProcess,
                underReview,
                completed
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve my task counts",
            error: error.message
        });
    }
};


// =========================
// UPDATE MY TASK STATUS
// =========================

const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "In Process",
            "Under Review",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task status"
            });
        }

        const task = await Task.findOne({
            _id: id,
            assignedTo: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        task.status = status;

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("assignedTo", "username email role")
            .populate("project", "name");

        res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            task: updatedTask
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task status",
            error: error.message
        });
    }
};


// =========================
// DELETE TASK - ADMIN
// =========================

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });
    }
};


export {
    assignTask,
    getAllTasks,
    getAllTaskCounts,
    getMyTasks,
    getMyTaskCounts,
    updateTaskStatus,
    deleteTask
};