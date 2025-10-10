const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const { customError } = require('../utils/errorHandler');

const authentication = async (req, res, next) => {
    try {
        //  Fetch Token
        const token = req.cookies?.token
            || req.body?.token
            || req.header("Authorization")?.replace("Bearer ", "");


        //  Validate Token
        if (!token) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            }).json({
                success: false,
                message: "Sign in again",
            }).status(266);
            return;
            // throw customError('Token Not Found', 404);
        }

        //  Verify Token
        try {
            const check = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = check;
            req.token = token;
        } catch (err) {
            throw customError('Invalid Token', 403);
        }

        const user = await User.findById(req.user.userId);
        if (!user || user.status === 'inactive') {
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            }).json({
                success: false,
                message: "Sign in again",
            }).status(266);
            return;
        }

        //  Move Forward
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
}

module.exports = {
    authentication
}