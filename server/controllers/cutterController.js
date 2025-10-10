const { errorResponse, customError } = require("../utils/errorHandler");
const Cutter = require("../models/cutterModel");
const Item = require("../models/itemModel");

const addCutter = (req, res) => {
    try {
        const { name, address, phoneNumber } = req.body;

        if (!name || !address || !phoneNumber) {
            throw customError("All fields are required", 400);
        }

        const newCutter = new Cutter({ name, address, phoneNumber });
        newCutter.save();

        return res.status(201).json({
            success: true,
            message: "Cutter added successfully",
            cutter: newCutter
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const getAllCutters = async (req, res) => {
    try {
        const cutters = await Cutter.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            cutters
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const showCutter = async (req, res) => {
    try {
        const { cutterId } = req.params;
        if (!cutterId) {
            throw customError("Cutter ID is required", 400);
        }

        const cutter = await Cutter.findByIdAndUpdate(cutterId, { visible: true }, { new: true });
        if (!cutter) {
            throw customError("Cutter not found", 404);
        }

        return res.status(200).json({
            success: true,
            cutter
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const hideCutter = async (req, res) => {
    try {
        const { cutterId } = req.params;
        if (!cutterId) {
            throw customError("Cutter ID is required", 400);
        }

        const cutter = await Cutter.findByIdAndUpdate(cutterId, { visible: false }, { new: true });
        if (!cutter) {
            throw customError("Cutter not found", 404);
        }

        return res.status(200).json({
            success: true,
            cutter
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const getDataByCutters = async (req, res) => {
    try {
        const cutters = await Cutter.find();

        const items = await Item.find({ shipTo: { $in: cutters.map(c => c._id) } })
            .populate('grade')
            .populate('width')
            .populate('thickness')
            .populate('shipTo');

        const order = await Booking.find({ 'items.item': { $in: items.map(i => i._id) } })
            .populate('bookedBy', 'name email phone role')
            .populate('items.item');

        return res.status(200).json({
            success: true,
            items
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

module.exports = {
    addCutter,
    getAllCutters,
    showCutter,
    hideCutter
};  