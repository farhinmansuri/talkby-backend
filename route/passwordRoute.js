const express = require('express')
const router = express.Router()
const { STATUS } = require('../db/status');
const User = require("../model/User");
const { sendOTPEmail } = require('../utils/email');
const { getSaltedPassword } = require('../utils/getSaltedPass');


router.post("/otpSend", async (req, resp) => {
    try {
        const { email } = req.body
        if (!email) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "email is require!"
            })
        }


        const recieverUser = await User.findOne({ 'email': email })
        if (!recieverUser) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "User not found!"
            })
        }

        const otp =
            Math.floor(1000 + Math.random() * 9000).toString();

        recieverUser.resetPasswordOtp = otp;
        recieverUser.resetPasswordOtpExpires =
            new Date(Date.now() + 10 * 60 * 1000);
        await recieverUser.save();
        await sendOTPEmail(email, otp);
        resp.status(STATUS.SUCEESS).json({
            status: STATUS.SUCEESS,
            message: "OTP sent successfully"
        });


    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })

    }
})
router.post("/verifyOtp", async (req, resp) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "email and otp both are require!"
            })
        }

        const recieverUser = await User.findOne({ 'email': email })
        if (!recieverUser) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "User not found!"
            })
        }

        if (!recieverUser.resetPasswordOtp) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "OTP not found!"
            })
        }

        if (recieverUser.resetPasswordOtpExpires < new Date()) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "OTP expired!"
            })
        }

        if (recieverUser.resetPasswordOtp !== otp) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "Invalid OTP!"
            })
        }


        resp.status(STATUS.SUCEESS).json({
            status: STATUS.SUCEESS,
            message: "OTP verified successfully",
            data: recieverUser._id
        })

    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })
    }
})
router.post("/changePasswordByVerifiedUser", async (req, resp) => {
    try {
        const { email, password, userId } = req.body

        if (!email || !password || !userId) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "email, password and userId all are require!"
            })
        }

        const saltedPassword = await getSaltedPassword(password);
        const updatedUser = await User.findOneAndUpdate({ email: email, _id: userId },
            {
                password: saltedPassword,
                resetPasswordOtp: null,
                resetPasswordOtpExpires: null
            },
            {
                new: true
            });

        if (!updatedUser) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "User not found!"
            })
        }

        resp.status(STATUS.SUCEESS).json({
            status: STATUS.SUCEESS,
            message: "Password updated!",
        })



    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })
    }
})
module.exports = router;