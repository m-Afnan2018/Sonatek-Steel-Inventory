const { errorResponse, customError } = require("../utils/errorHandler");
const Warehouse = require("../models/warehouseModel");
const Item = require("../models/itemModel");
const mongoose = require('mongoose');

const addWarehouse = async (req, res) => {
    try {
        const { name, address, phoneNumber } = req.body;

        if (!name || !address || !phoneNumber) {
            throw customError("All fields are required", 400);
        }

        const newWarehouse = new Warehouse({ name, address, phoneNumber });
        await newWarehouse.save();

        return res.status(201).json({
            success: true,
            message: "Warehouse added successfully",
            warehouse: newWarehouse
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const deleteWarehouse = async (req, res) => {
    try {
        const { warehouseId } = req.params;
        if (!warehouseId) {
            throw customError("Warehouse ID is required", 400);
        }

        const warehouse = await Warehouse.findByIdAndDelete(warehouseId);
        if (!warehouse) {
            throw customError("Warehouse not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: 'Warehouse deleted successfully',
            warehouse
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const updateWarehouse = async (req, res) => {
    try {
        const { warehouseId, name, address, phoneNumber } = req.body;

        if (!name && !address && !phoneNumber) {
            throw customError("Atleast one field is required", 400);
        }

        const warehouse = await Warehouse.findById(warehouseId);

        if (!warehouse) {
            throw customError("Unable to find the warehouse");
        }

        const newWarehouse = await Warehouse.findByIdAndUpdate(warehouseId, {
            name: name || warehouse.name,
            address: address || warehouse.address,
            phoneNumber: phoneNumber || warehouse.phoneNumber
        }, { new: true })

        return res.status(201).json({
            success: true,
            message: "Warehouse added successfully",
            warehouse: newWarehouse
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            warehouses
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const showWarehouse = async (req, res) => {
    try {
        const { warehouseId } = req.body;
        if (!warehouseId) {
            throw customError("Warehouse ID is required", 400);
        }

        const warehouse = await Warehouse.findByIdAndUpdate(warehouseId, { visible: true }, { new: true });
        if (!warehouse) {
            throw customError("Warehouse not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: 'Visibility Changed Successfully',
            warehouse
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const hideWarehouse = async (req, res) => {
    try {
        const { warehouseId } = req.body;
        if (!warehouseId) {
            throw customError("Warehouse ID is required", 400);
        }

        const warehouse = await Warehouse.findByIdAndUpdate(warehouseId, { visible: false }, { new: true });
        if (!warehouse) {
            throw customError("Warehouse not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: 'Visibility Changed Successfully',
            warehouse
        });
    } catch (err) {
        return errorResponse(res, err)
    }
}

const getDataByWarehouses = async (req, res) => {
    try {
        const { warehouse } = req.body;

        if (!warehouse) {
            return res.status(400).json({
                success: false,
                message: "Warehouse ID is required",
            });
        }

        // Get warehouse + basic item aggregation
        const warehouseData = await Warehouse.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(warehouse) },
            },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "warehouse",
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

        if (!warehouseData || warehouseData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found",
            });
        }

        // Populate item fields (grade, width, thickness)
        const populatedItems = await Item.find({ warehouse: warehouse })
            .populate("grade", "name")
            .populate("width", "name")
            .populate("thickness", "name");

        // Final result
        const result = {
            ...warehouseData[0],
            items: populatedItems,
        };

        res.status(200).json({
            success: true,
            message: "Fetched warehouse details successfully",
            data: result,
        });

    } catch (err) {
        console.error("Error fetching warehouse details:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouse details",
            error: err.message,
        });
    }
};

const getAllWarehouseDetails = async (req, res) => {
    try {
        const warehouses = await Warehouse.aggregate([
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "warehouse",
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
            message: "Fetched all warehouse details successfully",
            data: {
                total: warehouses.length,
                list: warehouses,
            },
        });
    } catch (err) {
        console.error("Error fetching warehouse details:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouse details",
            error: err.message,
        });
    }
};



module.exports = {
    addWarehouse,
    deleteWarehouse,
    updateWarehouse,
    getAllWarehouses,
    showWarehouse,
    hideWarehouse,
    getAllWarehouseDetails,
    getDataByWarehouses
};  