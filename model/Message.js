const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        // Which conversation does this message belong to?
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        // Who sent the message?
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Message content
        text: {
            type: String,
           
            maxlength: 5000
        },

        // text, image, video, audio, file
        messageType: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "audio",
                "file"
            ],
            default: "text"
        },

        // For image/file/video/audio messages
        media: {
            url: {
                type: String
            },

            fileName: {
                type: String
            },

            fileSize: {
                type: Number
            },

            mimeType: {
                type: String
            }
        },

        // Message reply
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },

        // Users who have read this message
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        // Message edited?
        isEdited: {
            type: Boolean,
            default: false
        },

        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Message",
    messageSchema
);