
const { customError, errorResponse } = require("../utils/errorHandler");
const Item = require("../models/itemModel");
const Thickness = require('../models/thicknessModel')
const Cutter = require('../models/cutterModel')
const Grade = require('../models/gradeModel')
const Width = require('../models/widthModel')

const addItem = async (req, res) => {
    try {
        // Fetching
        const { type, grade, formType, width, weight, thickness, wagonNumber, challan, quantity, shipTo } = req.body;
        const { challanNumber, challanDate } = challan;

        // Validation
        if (!type || !grade || !formType || !width || !weight || !thickness || !wagonNumber || !challanNumber || !challanDate || !quantity) {
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

        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true })
            .populate("grade width thickness shipTo");
        if (!updatedItem) throw customError('Item not found', 404);

        const formattedItems = {
            _id: updatedItem._id,
            name: `${updatedItem.wagonNumber} - ${updatedItem.type} - ${updatedItem.formType}`,
            type: updatedItem.type,
            grade: updatedItem.grade.name,
            formType: updatedItem.formType,
            width: updatedItem.width.name,
            remaining: updatedItem.remaining,
            thickness: updatedItem.thickness.name,
            createdAt: updatedItem.createdAt,
        };

        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            item: formattedItems
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
            .populate('challan');
        if (!item) throw customError('Item not found', 404);
        res.status(200).json({
            success: true,
            item
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

// Get all items with search, filter, sort, and pagination
const getAllItem = async (req, res) => {
    try {
        const {
            search,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit = 50,
            ...filters
        } = req.body;

        let query = {};

        // 🔍 Search (regex on multiple fields)
        if (search) {
            query.$or = [
                { type: { $regex: search, $options: "i" } },
                { wagonNumber: { $regex: search, $options: "i" } },
                { formType: { $regex: search, $options: "i" } }
            ];
        }

        // 🎯 Filtering (dynamic from query params)
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                query[key] = filters[key];
            }
        });

        // 📊 Pagination setup
        const skip = (page - 1) * limit;

        // 📦 Fetch items
        // .select('type formType wagonNumber')
        const items = await Item.find(query)
            .populate("grade width thickness shipTo challan")
            .sort({ [sortBy]: order === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // 📈 Total count for frontend
        const total = await Item.countDocuments(query);

        // 🏷 Map with custom "name"
        const formattedItems = items.map((item) => ({
            _id: item._id,
            name: `${item.wagonNumber} - ${item.type} - ${item.formType}`,
            type: item.type,
            grade: item.grade.name,
            formType: item.formType,
            width: item.width.name,
            remaining: item.quantity,
            wagonNumber: item.wagonNumber,
            challanNumber: item.challan.challanNumber,
            challanDate: item.challan.challanDate,
            thickness: item.thickness.name,
            createdAt: item.createdAt,
        }));

        res.status(200).json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            items: formattedItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        let returnValue;
        if (type === 'thickness') {
            const newThickness = new Thickness({
                name: Number(value)
            })
            returnValue = await newThickness.save();
        } else if (type === 'grade') {
            const newGrade = new Grade({
                name: value
            })
            returnValue = await newGrade.save();
        } else if (type === 'width') {
            const newWidth = new Width({
                name: value
            })
            returnValue = await newWidth.save();
        } else if (type === 'cutter') {
            const newCutter = new Cutter({
                name: value
            })
            returnValue = await newCutter.save();
        }

        // Sending response
        res.status(200).json({
            success: true,
            message: "Successfully added the varients",
            value: returnValue
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