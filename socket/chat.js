const Message = require("../model/Message")
const Conversation = require("../model/Conversation")
const socketHandler = (io) => {

    io.on('connection', (socket) => {
        console.log("User connected:", socket.id);


        // User joins
        socket.on("user_connected", (userId) => {

            console.log("User ID:", userId);
            console.log("Socket ID:", socket.id);

        });

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
        })

        socket.on("send_message", async (data) => {
            try {
                // console.log("============>")
                // console.log(data)
                // console.log("============>")
                const {
                    conversationId,
                    senderId,
                    text,
                    messageType
                } = data;
                if (!conversationId || !senderId || !text?.trim()) {
                    return;
                }


                //console.log(text)
                const message = await Message.create({
                    conversationId,
                    senderId,
                    messageType,
                    text: text


                });
                const savedMessage = await message.save()

                const lastMsg = messageType == 'text' ? text.slice(0, 20) : messageType
                const update = {
                    $set: {
                        lastMessage: savedMessage._id, lastMessageText: lastMsg, lastMessageCreatedAt: savedMessage.createdAt
                    }
                };
                await Conversation.findOneAndUpdate({ _id: conversationId }, update)


                const curerent_conversation = await Conversation.findById(conversationId)
                if (curerent_conversation) {
                    const particepents = curerent_conversation.participants
                    particepents.forEach(userId => {

                        if (userId.toString() !== senderId.toString()) {
                            io.to(userId.toString()).emit(
                                "receive_message",
                                savedMessage
                            );
                        }
                    })
                }




            } catch (error) {

            }
        })

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    })
}
module.exports = { socketHandler }
