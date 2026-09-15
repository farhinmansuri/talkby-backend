//const dns = require("dns");
const mongoose = require('mongoose')
//dns.setServers(["8.8.8.8", "1.1.1.1"]); // this is for local
mongoose.connect(process.env.MONGOOSE_URL)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => console.error('MongoDB connection error:', err));
const conn = mongoose.connection
module.exports = { conn }