const { errorResponse, customError } = require("../utils/errorHandler");
const Cutter = require("../models/cutterModel");
const Item = require("../models/itemModel");
const mongoose = require('mongoose');

const addCutter = async (req, res) => {
    try {
        const { name, address, phoneNumber } = req.body;

        if (!name || !address || !phoneNumber) {
            throw customError("All fields are required", 400);
        }

        const newCutter = new Cutter({ name, address, phoneNumber });
        await newCutter.save();

        return res.status(201).json({
            success: true,
            message: "Cutter added successfully",
            cutter: newCutter
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const updateCutter = async (req, res) => {
    try {
        const { cutterId, name, address, phoneNumber } = req.body;

        if (!name && !address && !phoneNumber) {
            throw customError("Atleast one field is required", 400);
        }

        const cutter = await Cutter.findById(cutterId);

        if (!cutter) {
            throw customError("Unable to find the cutter");
        }

        const newCutter = await Cutter.findByIdAndUpdate(cutterId, {
            name: name || cutter.name,
            address: address || cutter.address,
            phoneNumber: phoneNumber || cutter.phoneNumber
        }, { new: true })

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
        const { cutterId } = req.body;
        if (!cutterId) {
            throw customError("Cutter ID is required", 400);
        }

        const cutter = await Cutter.findByIdAndUpdate(cutterId, { visible: true }, { new: true });
        if (!cutter) {
            throw customError("Cutter not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: 'Visibility Changed Successfully',
            cutter
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const hideCutter = async (req, res) => {
    try {
        const { cutterId } = req.body;
        if (!cutterId) {
            throw customError("Cutter ID is required", 400);
        }

        const cutter = await Cutter.findByIdAndUpdate(cutterId, { visible: false }, { new: true });
        if (!cutter) {
            throw customError("Cutter not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: 'Visibility Changed Successfully',
            cutter
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const getDataByCutters = async (req, res) => {
    try {
        const { cutter } = req.body;

        if (!cutter) {
            return res.status(400).json({
                success: false,
                message: "Cutter ID is required",
            });
        }

        // Get cutter + basic item aggregation
        const cutterData = await Cutter.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(cutter) },
            },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "shipTo",
                    as: "items",
                },
            },
            {
                $addFields: {
                    totalItems: { $size: "$items" },
                    totalQuantity: {
                        $sum: "$items.quantity"
                    }
                }
            }
        ]);

        if (!cutterData || cutterData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cutter not found",
            });
        }

        // Populate item fields (grade, width, thickness)
        const populatedItems = await Item.find({ shipTo: cutter })
            .populate("grade", "name")
            .populate("width", "name")
            .populate("thickness", "name");

        // Final result
        const result = {
            ...cutterData[0],
            items: populatedItems,
        };

        res.status(200).json({
            success: true,
            message: "Fetched cutter details successfully",
            data: result,
        });

    } catch (err) {
        console.error("Error fetching cutter details:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cutter details",
            error: err.message,
        });
    }
};

const getAllCutterDetails = async (req, res) => {
    try {
        const cutters = await Cutter.aggregate([
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "shipTo",
                    as: "items",
                },
            },
            {
                $addFields: {
                    totalItems: { $size: "$items" },
                    totalQuantity: {
                        $sum: "$items.quantity"
                    }
                }
            },
            {
                $project: {
                    items: 0 // ❌ remove items from output
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Fetched all cutter details successfully",
            data: {
                total: cutters.length,
                list: cutters,
            },
        });
    } catch (err) {
        console.error("Error fetching cutter details:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cutter details",
            error: err.message,
        });
    }
};



module.exports = {
    addCutter,
    updateCutter,
    getAllCutters,
    showCutter,
    hideCutter,
    getAllCutterDetails,
    getDataByCutters
};  