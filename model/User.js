const mongoose = require("mongoose")
const User = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    password: String,
    resetPasswordOtp: {
        type: String
    },

    resetPasswordOtpExpires: {
        type: Date
    }
})
module.exports = mongoose.model("users", User)