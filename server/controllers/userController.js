const bcrypt = require('bcrypt');
const { customError, errorResponse } = require("../utils/errorHandler");
const User = require("../models/userModel");

const updateUser = async (req, res) => {
    try {
        // Fetching
        const { userId } = req.user;
        const { firstName, lastName, phoneNumber } = req.body;

        // Validation
        if (!userId) {
            throw customError('User ID is required', 400);
        }

        // Update logic here (e.g., find user and update fields)
        const user = await User.findById(userId);
        if (!user) {
            throw customError('User not found', 404);
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        // if (password) {
        //     user.password = await bcrypt.hash(password, 10);
        // }

        const updatedUser = await user.save();

        // Response
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const deleteUser = async (req, res) => {
    try {
        // Fetching
        const { userId } = req.body;

        // Validation
        if (!userId) {
            throw customError(400, 'User ID is required');
        }

        // Deletion logic here (e.g., find user and delete)
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw customError(404, 'User not found');
        }

        // Response
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const addUser = async (req, res) => {
    try {
        // Fetching
        const { userId } = req.body;

        // Validation
        if (!userId) {
            throw customError("User ID is required", 404);
        }
        const user = await User.findByIdAndUpdate(userId, { status: 'active' });

        if (!user) {
            throw customError("Unable to find the user", 401);
        }

        // Send Response
        res.status(200).json({
            success: true,
            message: "Sucessfully reactivated the user"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const removeUser = async (req, res) => {
    try {
        // Fetching
        const { userId } = req.body;

        // Validation
        if (!userId) {
            throw customError("User ID is required", 404);
        }
        const user = await User.findByIdAndUpdate(userId, { status: 'inactive' });

        if (!user) {
            throw customError("Unable to find the user", 401);
        }

        // Send Response
        res.status(200).json({
            success: true,
            message: "Sucessfully suspended the user"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const getUserDetails = async (req, res) => {
    try {
        // Fetching
        const { userId } = req.user;

        // Validation
        if (!userId) {
            throw customError('User ID is required', 400);
        }
        const user = await User.findById(userId);
        if (!user) {
            throw customError('User not found', 404);
        }

        // Response
        res.status(200).json({
            success: true,
            message: "Successfully fetched the user details",
            user
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const listUsers = async (req, res) => {
    try {
        // Fetching
        const users = await User.find();

        // Response
        res.status(200).json({
            success: true,
            message: "Successfully fetch the users list",
            users
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const updateUserRole = async (req, res) => {
    try {
        // Fetching
        const { userId, role } = req.body;

        // Validation
        if (!userId) {
            throw customError('User ID is required', 400);
        }

        if (!role || !['admin', 'director', 'inventory_associate', 'agent', 'accountant'].includes(role)) {
            throw customError('Invalid role specified', 400);
        }

        // Update logic here (e.g., find user and update role)
        const user = await User.findById(userId);
        if (!user) {
            throw customError('User not found', 404);
        }

        user.role = role;
        const updatedUser = await user.save();

        // Response
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: updatedUser
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const verifyUser = async (req, res) => {
    try {
        // Fetching
        const { userId, role } = req.body;
        if (!userId) {
            throw customError(400, 'User ID is required');
        }

        // Validation
        const user = await User.findById(userId);
        if (!user) {
            throw customError('User not found', 404);
        }
        if (user.isVerified) {
            throw customError('User is already verified', 400);
        }

        // Verification logic here
        user.isVerified = true;
        user.role = role;
        await user.save();

        // Response
        res.status(200).json({
            success: true,
            message: 'User verified successfully',
        });

    } catch (err) {
        errorResponse(res, err);
    }
}

module.exports = {
    updateUser,
    deleteUser,
    updateUserRole,
    getUserDetails,
    listUsers,
    verifyUser,
    removeUser,
    addUser
};