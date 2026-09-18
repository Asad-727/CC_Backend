// routes/chatR.js

import express from "express";

import {
    createChannel,
    getChannels,
    getChannelById,
    updateChannel,
    addMembers,
    deleteChannel,
    sendChannelMessage,
    getChannelMessages,
    getUsersForDM,
    sendDirectMessage,
    getDirectMessages,
    togglePinMessage,
    deleteMessage
} from "../controllers/chatC.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/role.js";

const router = express.Router();


// ==================== CHANNELS ====================

// Admin creates channel
router.post(
    "/channels",
    auth,
    adminOnly,
    createChannel
);

// Admin + Employee get channels
router.get(
    "/channels",
    auth,
    getChannels
);

// Get single channel
router.get(
    "/channels/:id",
    auth,
    getChannelById
);

// Admin update channel name/about
router.put(
    "/channels/:id",
    auth,
    adminOnly,
    updateChannel
);

// Admin add members
router.put(
    "/channels/:id/members",
    auth,
    adminOnly,
    addMembers
);

// Admin delete channel
router.delete(
    "/channels/:id",
    auth,
    adminOnly,
    deleteChannel
);


// ==================== CHANNEL MESSAGES ====================

// Send message in channel
router.post(
    "/channels/:channelId/messages",
    auth,
    sendChannelMessage
);

// Get channel messages
router.get(
    "/channels/:channelId/messages",
    auth,
    getChannelMessages
);


// ==================== DIRECT MESSAGES ====================

// Get users for DM
router.get(
    "/users",
    auth,
    getUsersForDM
);

// Send DM
router.post(
    "/direct/:receiverId",
    auth,
    sendDirectMessage
);

// Get DM conversation
router.get(
    "/direct/:userId",
    auth,
    getDirectMessages
);


// ==================== MESSAGE ACTIONS ====================

// Pin / Unpin
router.put(
    "/messages/:id/pin",
    auth,
    togglePinMessage
);

// Delete message
router.delete(
    "/messages/:id",
    auth,
    deleteMessage
);


export default router;