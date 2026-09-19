const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
//const  otpEmail =require('./templates/otpEmail.html')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
const loadTemplate = (fileName, replacements) => {
    const filePath = path.join(__dirname, "..", "templates", fileName);
    let html = fs.readFileSync(filePath, "utf-8");

    for (const key in replacements) {
        html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }

    return html;
};

const sendOTPEmail = async (email, otp) => {

   

    const html = loadTemplate("otpEmail.html", {
        OTP: otp,
        YEAR: new Date().getFullYear()
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "TalkBy Password Reset OTP",
        html
    });
};

module.exports = {
    sendOTPEmail
};