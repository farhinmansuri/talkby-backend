const express = require('express');
const { STATUS } = require('../db/status');
const router = express.Router();
const User = require("../model/User")

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const getSaltedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}



router.post("/register", async (req, resp) => {

    try {
        const { email, password, firstName, middleName, lastName } = req.body

        if (!firstName || !email || !password) {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: "Email, Password and First name are Complesory!"
            })
        } else {

            const existUser = await User.findOne({ email: email })
            if (!existUser) {
                resp.status(STATUS.ERROR).json({
                    status: STATUS.ERROR,
                    message: "User with this email already exist!"
                })
            } else {

                const newUser = User({
                    firstName,
                    middleName,
                    lastName,
                    email,

                })
                newUser.password = await getSaltedPassword(password)
                await newUser.save()
                const payload = {
                    email: newUser.email
                };
                jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, async (err, token) => {
                    if (err) throw err
                    const savedUser = await User.findById(newUser.id).select('-password')
                    const finalUser = {
                        ...savedUser.toObject(),
                        token: token
                    }
                    resp.status(STATUS.SUCEESS).json({
                        status: STATUS.SUCEESS,
                        message: "User Added",
                        data: finalUser
                    })
                })


            }


        }


    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })

    }
})

router.post("/login", async (req, resp) => {
    try {
        const { email, password } = req.body

        let user = await User.findOne({ email })
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {

                if (err) {
                    console.log(err)
                    resp.status(STATUS.ERROR).json({
                        status: STATUS.ERROR,
                        message: "Password dose not match"
                    })
                } else if (result) {
                    const payload = {
                        email: user.email
                    };
                    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
                        async (err, token) => {
                            if (err) throw err
                            user.password = null
                            const finalUser = {
                                ...user.toObject(),
                                token: token
                            }

                            resp.status(STATUS.SUCEESS).json({
                                status: STATUS.SUCEESS,
                                message: "User Login done",
                                data: finalUser
                            })
                        }
                    )
                } else {
                    resp.status(STATUS.ERROR).json({
                        status: STATUS.ERROR,
                        message: "Password dose not match"
                    })
                }
            })







        } else {
            resp.status(STATUS.ERROR).json({
                status: STATUS.ERROR,
                message: 'User dose not exist!'
            })
        }

    } catch (error) {
        resp.status(STATUS.SERVER_ERROR).json({
            status: STATUS.SERVER_ERROR,
            message: error.message
        })
    }
})
module.exports = router