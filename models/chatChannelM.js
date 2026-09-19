
import mongoose from "mongoose";

const chatChannelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        about: {
            type: String,
            default: "",
            trim: true
        },

        type: {
            type: String,
            enum: ["channel"],
            default: "channel"
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isAnnouncement: {
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

const ChatChannel = mongoose.model("ChatChannel", chatChannelSchema);

export default ChatChannel;