
const { customError, errorResponse } = require("../utils/errorHandler");
const Item = require("../models/itemModel");
const Thickness = require('../models/thicknessModel')
const Cutter = require('../models/cutterModel')
const Grade = require('../models/gradeModel')
const Width = require('../models/widthModel')

const addItem = async (req, res) => {
    try {
        // Fetching
        const { type, grade, formType, width, weight, thickness, wagonNumber, challan, quantity, pricePerUnit, shipTo } = req.body;
        const { challanNumber, challanDate } = challan;

        // Validation
        if (!type || !grade || !formType || !width || !weight || !thickness || !wagonNumber || !challanNumber || !challanDate || !quantity || !pricePerUnit) {
            throw customError('All fields are required', 400);
        }
        const cutterChecker = await Cutter.findById(shipTo);
        const widthChecker = await Width.findById(width);
        const thicknessChecker = await Thickness.findById(thickness);
        const gradeChecker = await Grade.findById(grade)

        if (!thicknessChecker) {
            throw customError("Invalid Thickness is Selected",);
        }
        if (!gradeChecker) {
            throw customError("Invaldi Grade is selected");
        }
        if (!widthChecker) {
            throw customError('Invalid Width is selected');
        }
        if (!cutterChecker) {
            throw customError('Invalid Cutter is selected');
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
            shipTo,
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
        const updateData = req.body;

        // Prevent updating _id
        const id = updateData._id;
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

const getItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = await Item.findById(itemId)
            .populate('width')
            .populate('thickness')
            .populate('shipTo')
            .populate('grade')
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
            .populate('shipTo')
            .populate('grade')
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
        const { itemId } = req.body;
        const deleted = await Item.findByIdAndDelete(itemId);
        if (!deleted) throw customError('Item not found', 404);
        res.status(200).json({
            success: true,
            message: "Item deleted successfully"
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const addVarient = async (req, res) => {
    try {
        // Fetching 
        const { type, value } = req.body;

        //  Validation
        if (!type || !value) {
            throw customError("Type and Value are required", 404);
        }
        if (!['thickness', 'grade', 'width', 'cutter'].includes(type)) {
            throw customError("Invalid Type", 400)
        }

        // Performing Task
        if (type === 'thickness') {
            const newThickness = new Thickness({
                thickness: Number(value)
            })
            await newThickness.save();
        } else if (type === 'grade') {
            const newGrade = new Grade({
                grade: value
            })
            await newGrade.save();
        } else if (type === 'width') {
            const newWidth = new Width({
                width: value
            })
            await newWidth.save();
        } else if (type === 'cutter') {
            const newCutter = new Cutter({
                name: value
            })
            await newCutter.save();
        }

        // Sending response
        res.status(200).json({
            success: true,
            message: "Successfully added the varients"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const getAllVarients = async (req, res) => {
    try {
        // Performing Task
        const cutters = await Cutter.find({});
        const grades = await Grade.find({})
        const thickness = await Thickness.find({});
        const widths = await Width.find({});

        res.status(200).json({
            success: true,
            cutters,
            grades,
            thickness,
            widths
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const getVarients = async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            throw customError("Type is required", 400);
        }
        if (!['thickness', 'grade', 'width', 'cutter'].includes(type)) {
            throw customError("Invalid Type", 400);
        }

        let data = [];
        if (type === 'thickness') data = await Thickness.find();
        else if (type === 'grade') data = await Grade.find();
        else if (type === 'width') data = await Width.find();
        else if (type === 'cutter') data = await Cutter.find();

        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const updateVarient = async (req, res) => {
    try {
        const { type, id, value } = req.body;

        if (!type || !id || !value) {
            throw customError("Type, Id and Value are required", 400);
        }
        if (!['thickness', 'grade', 'width', 'cutter'].includes(type)) {
            throw customError("Invalid Type", 400);
        }

        let updatedDoc;
        if (type === 'thickness') {
            updatedDoc = await Thickness.findByIdAndUpdate(id, { thickness: Number(value) }, { new: true });
        } else if (type === 'grade') {
            updatedDoc = await Grade.findByIdAndUpdate(id, { grade: value }, { new: true });
        } else if (type === 'width') {
            updatedDoc = await Width.findByIdAndUpdate(id, { width: value }, { new: true });
        } else if (type === 'cutter') {
            updatedDoc = await Cutter.findByIdAndUpdate(id, { name: value }, { new: true });
        }

        if (!updatedDoc) {
            throw customError("Variant not found", 404);
        }

        res.status(200).json({
            success: true,
            message: "Successfully updated variant",
            data: updatedDoc
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const deleteVarient = async (req, res) => {
    try {
        const { type, id } = req.body;

        if (!type || !id) {
            throw customError("Type and Id are required", 400);
        }
        if (!['thickness', 'grade', 'width', 'cutter'].includes(type)) {
            throw customError("Invalid Type", 400);
        }

        // Step 1: Find the variant
        let variantDoc;
        if (type === 'thickness') variantDoc = await Thickness.findById(id);
        else if (type === 'grade') variantDoc = await Grade.findById(id);
        else if (type === 'width') variantDoc = await Width.findById(id);
        else if (type === 'cutter') variantDoc = await Cutter.findById(id);

        if (!variantDoc) {
            throw customError("Variant not found", 404);
        }

        // Step 2: Check if variant is used in Products
        let isUsed = false;
        if (type === 'thickness') {
            isUsed = await Item.exists({ thickness: variantDoc._id });
        } else if (type === 'grade') {
            isUsed = await Item.exists({ grade: variantDoc._id });
        } else if (type === 'width') {
            isUsed = await Item.exists({ width: variantDoc._id });
        } else if (type === 'cutter') {
            isUsed = await Item.exists({ shipTo: variantDoc._id });
        }

        if (isUsed) {
            throw customError("Cannot delete, this variant is in use", 409);
        }

        // Step 3: Safe to delete
        await variantDoc.deleteOne();

        res.status(200).json({
            success: true,
            message: "Successfully deleted variant"
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

module.exports = {
    addItem,
    updateItem,
    getItem,
    getAllItem,
    deleteItem,
    addVarient,
    getVarients,
    getAllVarients,
    updateVarient,
    deleteVarient
}