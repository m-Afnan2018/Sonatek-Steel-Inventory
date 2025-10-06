const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const OTP = require('../models/otpModel')
const jwt = require('jsonwebtoken')
const { customError, errorResponse } = require('../utils/errorHandler');
const generateNumericOTP = require('../utils/otpGenerator');
const sendMail = require('../utils/mailSender');
const { forgetPasswordMail } = require('../mails/forgetPassword');

const createDirector = async (req, res) => {
    try {
        // Fetching
        const { firstName, lastName, email, password } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            throw customError(400, 'All fields are required');
        }
        if (password.length < 8) {
            throw customError(400, 'Password must be at least 8 characters long');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw customError(400, 'User already exists');
        }

        // Create new user
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashPassword,
            role: 'director'
        });

        const savedUser = await newUser.save();

        // Response
        res.status(201).json({
            success: true,
            message: 'Director created successfully',
            user: savedUser
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const registerUser = async (req, res) => {
    try {
        //  Fetching
        const { firstName, lastName, email, password, role } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            throw customError(400, 'All fields are required');
        }
        if (password.length < 8) {
            throw customError(400, 'Password must be at least 8 characters long');
        }
        if (role && !['admin', 'director', 'inventory_associate', 'agent', 'accountant'].includes(role)) {
            throw customError(400, 'Invalid role specified');
        }
        const alreadyRegisteredEmail = await User.findOne({ email });
        if (alreadyRegisteredEmail) {
            throw customError('This email is already registered', 304);
        }

        // Registration logic here (e.g., save user to database)
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashPassword,
            role
        });

        const savedUser = await newUser.save();

        // Response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: savedUser
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const loginUser = async (req, res) => {
    try {
        // Fetching
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            throw customError('Email and password are required', 404);
        }

        // Login logic here (e.g., check user credentials)
        const user = await User.findOne({ email }, '+password');
        if (!user) {
            throw customError('Invalid email or password', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw customError('Invalid email or password', 401);
        }

        const payload = {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            email: user.email,
            isVerified: user.isVerified
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);

        // Response
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            secure: true,
            partitioned: false
        }).status(200).json({
            success: true,
            message: 'User logged in successfully',
            token,
            user: payload
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const forgetPassword = async (req, res) => {
    try {
        // Fetching
        const { email } = req.body;

        // Validation
        if (!email) {
            throw customError(400, 'Email is required');
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw customError(404, 'User not found');
        }
        const oldOtp = await OTP.findOne({ email })

        if (oldOtp) {
            if (oldOtp.retries > 5) {
                throw customError('OTP generation limit reached', 501);
            }
            await OTP.findByIdAndUpdate(oldOtp._id, {
                retries: oldOtp.retries + 1,
            })
            await sendMail(
                email,
                "Forget Password - Sonatek Steel Inventory",
                forgetPasswordMail(oldOtp.otp)
            );
        } else {
            // Password reset logic here (e.g., generate token, send email)
            const otp = generateNumericOTP(6);

            const newOtp = new OTP({
                email, otp
            })

            await newOtp.save();
        }


        // Response
        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const resetPassword = async (req, res) => {
    try {
        // Fetching
        const { email, password, otp } = req.body;

        // Validation 
        if (!email || !password || !otp) {
            throw customError("All fields are required", 404);
        }
        if (password.length < 8) {
            throw customError("Password length should be atleast 8", 400);
        }
        const otpCheck = await OTP.findOne({ email });
        if (!otpCheck) {
            throw customError("No reset password request found", 401);
        }
        console.log(otpCheck)
        if (otpCheck.otp !== Number(otp)) {
            otpCheck.checkRetries += 1;
            otpCheck.save();
            throw customError("OTP mismatched", 401);
        }
        if (otpCheck.checkRetries > 5) {
            throw customError("Maximum number of limit reached for this account", 502);
        }

        // Performing Task
        const hashPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate({ email }, {
            password: hashPassword
        })

        // Send Response
        res.status(200).json({
            succes: true,
            message: "Successfully changed the password of the user"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const getUser = async (req, res) => {
    try {
        const user = req.user;
        const findUser = await User.findById(user.userId);

        if (!findUser) {
            throw customError("Unable to find the user", 404);
        }

        const payload = {
            userId: findUser._id,
            firstName: findUser.firstName,
            lastName: findUser.lastName,
            phoneNumber: findUser.phoneNumber,
            role: findUser.role,
            email: findUser.email,
            isVerified: findUser.isVerified
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            secure: true,
            partitioned: false
        }).status(200).json({
            success: true,
            message: "Successfully fetched the user",
            user: payload,
            token,
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.send({ message: "Logged out successfully" });
    } catch (err) {
        errorResponse(res, err);
    }
}

module.exports = {
    createDirector,
    registerUser,
    loginUser,
    forgetPassword,
    resetPassword,
    getUser,
    logoutUser
}