const mongoose = require("mongoose")
const User = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    password: String
})
module.exports = mongoose.model("users", User)