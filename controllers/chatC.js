// controllers/chatC.js

import ChatChannel from "../models/chatChannelM.js";
import ChatMessage from "../models/chatMessageM.js";
import User from "../models/loginM.js";

// Check if current user is admin
const isAdmin = (user) => {
    return user?.role === "admin";
};

// Check if current user is HR
const isHR = (user) => {
    const department = String(user?.department || "").toLowerCase();
    const jobRole = String(user?.jobRole || "").toLowerCase();
    const designation = String(user?.designation || "").toLowerCase();

    return (
        department === "hr" ||
        jobRole === "hr" ||
        jobRole === "human resources" ||
        designation === "hr" ||
        designation === "human resources"
    );
};

// Create Channel
export const createChannel = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        const { name, about, isAnnouncement, members } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Channel name is required"
            });
        }

        const existingChannel = await ChatChannel.findOne({
            name: name.trim(),
            isDeleted: false
        });

        if (existingChannel) {
            return res.status(409).json({
                success: false,
                message: "Channel already exists"
            });
        }

        let memberIds = [];

        if (Array.isArray(members)) {
            const users = await User.find({
                _id: { $in: members }
            }).select("_id");

            memberIds = users.map((user) => user._id);
        }

        if (!memberIds.some((id) => id.equals(req.user._id))) {
            memberIds.push(req.user._id);
        }

        const channel = await ChatChannel.create({
            name: name.trim(),
            about: about || "",
            members: memberIds,
            createdBy: req.user._id,
            isAnnouncement: isAnnouncement === true
        });

        const populatedChannel = await ChatChannel.findById(channel._id)
            .populate("createdBy", "username email role")
            .populate("members", "username email role");

        return res.status(201).json({
            success: true,
            message: "Channel created successfully",
            channel: populatedChannel
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create channel",
            error: error.message
        });
    }
};


// Get Channels
export const getChannels = async (req, res) => {
    try {
        const user = req.user;

        let query = {
            isDeleted: false
        };

        // Announcement is visible to Admin and HR.
        // Normal employees can see announcement but cannot send messages.
        const channels = await ChatChannel.find(query)
            .populate("createdBy", "username email role")
            .populate("members", "username email role")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: channels.length,
            channels
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get channels",
            error: error.message
        });
    }
};


// Get Single Channel
export const getChannelById = async (req, res) => {
    try {
        const { id } = req.params;

        const channel = await ChatChannel.findOne({
            _id: id,
            isDeleted: false
        })
            .populate("createdBy", "username email role")
            .populate("members", "username email role");

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found"
            });
        }

        return res.status(200).json({
            success: true,
            channel
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get channel",
            error: error.message
        });
    }
};


// Rename / Update Channel
export const updateChannel = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        const { id } = req.params;
        const { name, about } = req.body;

        const channel = await ChatChannel.findOne({
            _id: id,
            isDeleted: false
        });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found"
            });
        }

        if (name) {
            const existingChannel = await ChatChannel.findOne({
                name: name.trim(),
                _id: { $ne: id },
                isDeleted: false
            });

            if (existingChannel) {
                return res.status(409).json({
                    success: false,
                    message: "Channel name already exists"
                });
            }

            channel.name = name.trim();
        }

        if (about !== undefined) {
            channel.about = about;
        }

        await channel.save();

        return res.status(200).json({
            success: true,
            message: "Channel updated successfully",
            channel
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update channel",
            error: error.message
        });
    }
};


// Add Members
export const addMembers = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        const { id } = req.params;
        const { members } = req.body;

        if (!Array.isArray(members) || members.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Members array is required"
            });
        }

        const channel = await ChatChannel.findOne({
            _id: id,
            isDeleted: false
        });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found"
            });
        }

        const users = await User.find({
            _id: { $in: members }
        }).select("_id");

        const validMemberIds = users.map((user) => user._id);

        validMemberIds.forEach((memberId) => {
            if (!channel.members.some((id) => id.equals(memberId))) {
                channel.members.push(memberId);
            }
        });

        await channel.save();

        const updatedChannel = await ChatChannel.findById(id)
            .populate("members", "username email role");

        return res.status(200).json({
            success: true,
            message: "Members added successfully",
            channel: updatedChannel
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add members",
            error: error.message
        });
    }
};


// Delete Channel
export const deleteChannel = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        const { id } = req.params;

        const channel = await ChatChannel.findOne({
            _id: id,
            isDeleted: false
        });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found"
            });
        }

        channel.isDeleted = true;
        await channel.save();

        return res.status(200).json({
            success: true,
            message: "Channel deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete channel",
            error: error.message
        });
    }
};


// Send Channel Message
export const sendChannelMessage = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { message, attachment, attachmentType } = req.body;

        const channel = await ChatChannel.findOne({
            _id: channelId,
            isDeleted: false
        });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found"
            });
        }

        // Employees cannot send announcements
        if (
            channel.isAnnouncement &&
            !isAdmin(req.user) &&
            !isHR(req.user)
        ) {
            return res.status(403).json({
                success: false,
                message: "Only Admin and HR can send announcements"
            });
        }

        if (!message && !attachment) {
            return res.status(400).json({
                success: false,
                message: "Message or attachment is required"
            });
        }

        const newMessage = await ChatMessage.create({
            sender: req.user._id,
            channel: channelId,
            message: message || "",
            attachment: attachment || null,
            attachmentType: attachmentType || null
        });

        const populatedMessage = await ChatMessage.findById(newMessage._id)
            .populate("sender", "username email role");

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send message",
            error: error.message
        });
    }
};


// Get Channel Messages
export const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { search } = req.query;

        const channel = await ChatChannel.findOne({
            _id: channelId,
            isDeleted: false
        });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found"
            });
        }

        const query = {
            channel: channelId,
            isDeleted: false
        };

        if (search) {
            query.message = {
                $regex: search,
                $options: "i"
            };
        }

        const messages = await ChatMessage.find(query)
            .populate("sender", "username email role")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get channel messages",
            error: error.message
        });
    }
};


// Get Users for Direct Messages
export const getUsersForDM = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.user._id }
        }).select("username email role");

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get users",
            error: error.message
        });
    }
};


// Send Direct Message
export const sendDirectMessage = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const { message, attachment, attachmentType } = req.body;

        if (!message && !attachment) {
            return res.status(400).json({
                success: false,
                message: "Message or attachment is required"
            });
        }

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        const newMessage = await ChatMessage.create({
            sender: req.user._id,
            receiver: receiverId,
            message: message || "",
            attachment: attachment || null,
            attachmentType: attachmentType || null
        });

        const populatedMessage = await ChatMessage.findById(newMessage._id)
            .populate("sender", "username email role")
            .populate("receiver", "username email role");

        return res.status(201).json({
            success: true,
            message: "Direct message sent successfully",
            data: populatedMessage
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send direct message",
            error: error.message
        });
    }
};


// Get Direct Messages
export const getDirectMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { search } = req.query;

        const otherUser = await User.findById(userId);

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const query = {
            isDeleted: false,
            $or: [
                {
                    sender: req.user._id,
                    receiver: userId
                },
                {
                    sender: userId,
                    receiver: req.user._id
                }
            ]
        };

        if (search) {
            query.message = {
                $regex: search,
                $options: "i"
            };
        }

        const messages = await ChatMessage.find(query)
            .populate("sender", "username email role")
            .populate("receiver", "username email role")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get direct messages",
            error: error.message
        });
    }
};


// Pin / Unpin Message
export const togglePinMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const chatMessage = await ChatMessage.findOne({
            _id: id,
            isDeleted: false
        });

        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        chatMessage.isPinned = !chatMessage.isPinned;

        await chatMessage.save();

        return res.status(200).json({
            success: true,
            message: chatMessage.isPinned
                ? "Message pinned successfully"
                : "Message unpinned successfully",
            data: chatMessage
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update pinned message",
            error: error.message
        });
    }
};


// Delete Message
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const chatMessage = await ChatMessage.findOne({
            _id: id,
            isDeleted: false
        });

        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        // Admin can delete any message.
        // Normal user can delete only own message.
        if (
            !isAdmin(req.user) &&
            !chatMessage.sender.equals(req.user._id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own messages"
            });
        }

        chatMessage.isDeleted = true;
        await chatMessage.save();

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete message",
            error: error.message
        });
    }
};