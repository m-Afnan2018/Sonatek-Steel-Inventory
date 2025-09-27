
const { customError, errorResponse } = require("../utils/errorHandler");
const Item = require("../models/itemModel");

const addItem = async (req, res) => {
    try {
        // Fetching
        const { type, grade, formType, width, weight, thickness, wagonNumber, challanNumber, challanDate, quantity, pricePerUnit } = req.body;

        // Validation
        if (!type || !grade || !formType || !width || !weight || !thickness || !wagonNumber || !challanNumber || !challanDate || !quantity || !pricePerUnit) {
            throw customError('All fields are required', 400);
        }

        // Create new item
        const newItem = new Item({
            type,
            grade,
            formType,
            width,
            thickness,
            weight,
            wagonNumber,
            challan: {
                challanNumber,
                challanDate
            },
            quantity,
            pricePerUnit
        });

        await newItem.save();

        res.status(201).json({
            success: true,
            message: "Item added successfully",
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent updating _id
        if (updateData._id) delete updateData._id;

        // If challan fields are present, nest them
        if (updateData.challanNumber || updateData.challanDate) {
            updateData.challan = {
                challanNumber: updateData.challanNumber,
                challanDate: updateData.challanDate
            };
            delete updateData.challanNumber;
            delete updateData.challanDate;
        }

        updateData.updatedAt = Date.now();

        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedItem) throw customError('Item not found', 404);

        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            item: updatedItem
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const getSingleItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id)
            .populate('width')
            .populate('thickness')
            .populate('weight');
        if (!item) throw customError('Item not found', 404);
        res.status(200).json({
            success: true,
            item
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const getAllItem = async (req, res) => {
    try {
        const items = await Item.find()
            .populate('width')
            .populate('thickness')
            .populate('challan');
        res.status(200).json({
            success: true,
            items
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Item.findByIdAndDelete(id);
        if (!deleted) throw customError('Item not found', 404);
        res.status(200).json({
            success: true,
            message: "Item deleted successfully"
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

module.exports = {
    addItem, updateItem, getSingleItem, getAllItem, deleteItem
}