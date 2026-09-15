const mongoose = require('mongoose')
const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["private", "group"],
        required: true
    },

    // Users participating in conversation
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        }
    ],

    // Only required for group
    name: {
        type: String,
        trim: true
    },

    // Only required for group
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // Last message information
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastMessageText: {
        type: String
    },
    lastMessageCreatedAt: {
        type: Date,
        default: Date.now

    },
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);