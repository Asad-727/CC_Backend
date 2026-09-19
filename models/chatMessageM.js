 
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatChannel",
            default: null
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        message: {
            type: String,
            trim: true,
            default: ""
        },

        attachment: {
            type: String,
            default: null
        },

        attachmentType: {
            type: String,
            default: null
        },

        isPinned: {
            type: Boolean,
            default: false
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;