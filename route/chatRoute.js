const express = require('express')
const { model } = require('mongoose')
const { STATUS } = require('../db/status')
const User = require('../model/User')
const router = express.Router()
const Conversation = require("../model/Conversation")
const Message = require('../model/Message')

router.get("/searchUser", async (req, resp) => {
    try {
        const { searchText, self_id } = req.query
        if (typeof searchText !== 'string') {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: 'searchText must be a valid string'
            })
        }
        const trimmedSearch = searchText.trim();

        if (!trimmedSearch) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: 'searchText must be a valid string'
            })
        }
        const searchRegex = new RegExp(trimmedSearch, 'i');

        const users = await User.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex }
            ],
            $nor: [
                { _id: self_id }
            ]
        })
            .select('-password -resetPasswordOtp -resetPasswordOtpExpires') // Optional: Exclude sensitive fields from results
            .limit(20)
            .lean();
        const userIds = users.map(user => user._id);


        // Find conversations where self_id and searched users are both participants
        const conversations = await Conversation.find({
            participants: {
                $all: [self_id],
                $in: userIds
            }
        }).select("_id participants").lean();

        const conversationMap = {};

        conversations.forEach(conversation => {

            const otherUser = conversation.participants.find(
                participant =>
                    participant.toString() !== self_id.toString()
            );

            if (otherUser) {
                conversationMap[otherUser.toString()] =
                    conversation._id;
            }
        });

        const result = users.map(user => ({
            ...user,
            conversation_id:
                conversationMap[user._id.toString()] || null
        }));


        resp.status(STATUS.SUCEESS).json({
            status: STATUS.SUCEESS,
            message: "Founded users",
            data: result
        })


    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })
    }


})

router.post("/createNewConversation", async (req, resp) => {
    try {
        const { type, participants } = req.body
        if (!type || !participants) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "To create conversation type and participants are required!"
            })
        } else {
            const newConversation = Conversation({
                type,
                participants
            })
            const savedConversation = await newConversation.save();
            resp.status(STATUS.SUCEESS).json({
                status: STATUS.SUCEESS,
                message: "Conversation Created",
                data: savedConversation
            })

        }

    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })
    }
})
router.get("/getMyConversations", async (req, resp) => {
    try {
        const { userId } = req.query
        if (!userId) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "To get conversations User Id is required!"
            })
        }
        const conversations = await Conversation.find({
            participants: userId
        })
            .sort({ updatedAt: -1 })
            .lean();

        const result = await Promise.all(
            conversations.map(async (conversation) => {

                // PRIVATE CHAT
                if (conversation.type === "private") {

                    const oppositeUserId = conversation.participants.find(
                        id => id.toString() !== userId.toString()
                    );

                    const oppositeUser = await User.findById(oppositeUserId)
                        .select("-password -resetPasswordOtp -resetPasswordOtpExpires")
                        .lean();

                    return {
                        ...conversation,
                        opositeUser: oppositeUser
                    };
                }

                // GROUP CHAT
                return {
                    ...conversation
                };
            })
        );

        return resp.status(STATUS.SUCEESS).json({
            status: STATUS.SUCEESS,
            message: "Conversation found",
            data: result
        })

    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })
    }
})

router.get("/getConversationMessage", async (req, resp) => {
    try {
        const { conversationId } = req.query
        const { page, limit } = req.query
        //console.log("param"+req.query.limit)


        if (!conversationId) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "To get conversations conversationId is required!"
            })
        }






        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const query = { conversationId: conversationId };


        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)

        const totalMessages = await Message.countDocuments(query)

        resp.status(STATUS.SUCEESS).json({
            status: STATUS.SUCEESS,
            message: "Message found",
            data: messages.reverse(),
            pagination: {
                totalMessages: totalMessages,
                page: page,
                limit: limit,
                totalpages: Math.ceil(totalMessages / limitNum)
            }
        })






    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })
    }
})

module.exports = router