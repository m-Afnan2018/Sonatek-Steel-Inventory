const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken')
const { customError, errorResponse } = require('../utils/errorHandler');
const generateNumericOTP = require('../utils/otpGenerator');

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

        // Password reset logic here (e.g., generate token, send email)
        const otp = generateNumericOTP(6);

        // Send email with reset link (pseudo-code)
        await sendMail(user.email, 'Password Reset', `Your OTP is: ${otp}`);

        // Response
        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

module.exports = {
    createDirector,
    registerUser,
    loginUser,
    forgetPassword
}