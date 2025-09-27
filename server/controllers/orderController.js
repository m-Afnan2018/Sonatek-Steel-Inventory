
const { customError, errorResponse } = require("../utils/errorHandler");
const Order = require("../models/orderModel");
const { v4: uuidv4 } = require('uuid');



const createOrder = async (req, res) => {
    try {
        const { item, quantity, totalPrice, vehicleNumber, status, orderDate, deliveryDate } = req.body;

        // Validation
        if (!item || !quantity || !totalPrice || !vehicleNumber || !status) {
            throw customError('All fields are required', 400);
        }

        const newOrder = new Order({
            order_id: uuidv4(),
            item,
            quantity,
            totalPrice,
            vehicleNumber,
            status,
            orderDate,
            deliveryDate
        });
        await newOrder.save();
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: newOrder
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const updateOrder = async (req, res) => {
    try {
        // Fetching Data
        const { id } = req.params;
        const updateData = req.body;

        // Validation

        if (updateData._id) delete updateData._id;

        updateData.updatedAt = Date.now();

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedOrder) throw customError('Order not found', 404);

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Order.findByIdAndDelete(id);

        if (!deleted) throw customError('Order not found', 404);

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id).populate('item');

        if (!order) throw customError('Order not found', 404);

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

model.exports = {
    createOrder,
    updateOrder,
    deleteOrder,
    getOrder
}