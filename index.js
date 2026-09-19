require('dotenv').config()
require('./db/config')
const express = require('express')

const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));




app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(bodyParser.json());







const userRouter = require('./route/userRoute')
app.use("/api/user", userRouter)

const passwordRouter = require('./route/passwordRoute')
app.use("/api/password", passwordRouter)

const chatRouter = require("./route/chatRoute")
app.use("/api/chat", chatRouter)




const server = http.createServer(app)

const { Server } = require('socket.io');
const { socketHandler } = require('./socket/chat');

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['POST', 'GET'],
        credentials: true,
    }
})
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});