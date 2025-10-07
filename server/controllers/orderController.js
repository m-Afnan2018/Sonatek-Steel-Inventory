
const { customError, errorResponse } = require("../utils/errorHandler");
const Order = require("../models/orderModel");
const Item = require("../models/itemModel");
const User = require('../models/userModel')
const { v4: uuidv4 } = require('uuid');

const createOrder = async (req, res) => {
    try {
        const { userId } = req.user;
        const { items, requirement } = req.body;

        if (!items?.length) throw customError("Please select items", 404);

        // Fetch and sort items by createdAt (oldest first)
        const allItems = await Item.find({ _id: { $in: items } }).sort({ createdAt: 1 });

        let remaining = requirement;
        let totalUsed = 0;

        const takenItems = [];

        for (const item of allItems) {
            if (remaining <= 0) break; // stop once requirement is fulfilled

            const used = Math.min(item.quantity, remaining);
            if (used > 0) {
                item.quantity -= used;
                remaining -= used;
                totalUsed += used;
                takenItems.push({ item: item._id, quantity: used })
                await item.save(); // update only affected items
            }
        }

        if (remaining > 0) throw customError("Not enough stock to fulfill requirement", 400);

        const newOrder = await Order.create({
            order_id: uuidv4(),
            items: takendItems,
            quantity: totalUsed,
            requirement,
            orderBy: userId
        });

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

const getAllOrders = async (req, res) => {
    try {
        const { search } = req.body;

        let query = {};

        // 🔍 If there's a search term, filter by order_id or vehicleNumber
        if (search && search.trim() !== "") {
            query = {
                $or: [
                    { order_id: { $regex: search, $options: "i" } },
                    { vehicleNumber: { $regex: search, $options: "i" } },
                ],
            };
        }

        const orders = await Order.find(query)
            .populate("item", "name quantity") // populate item name & quantity
            .populate("orderBy", "firstName lastName email") // populate user info
            .sort({ orderDate: -1 }); // latest first

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (err) {
        errorResponse(res, err);
    }
};


const getMyOrders = async (req, res) => {
    try {
        // Fetching
        const { userId } = req.user;

        // Validation
        if (!userId) {
            throw customError("Please relogin", 400);
        }
        const orders = await Order.find({ orderBy: userId })
            .populate({
                path: 'items.item',
                populate: [
                    { path: 'grade', select: 'name' },
                    { path: 'thickness', select: 'name' }
                ]
            });

        const allOrders = orders.map((order) => {
            const payload = {
                _id: order._id,
                quantity: order.quantity,
                requirement: order.requirement,
                status: order.status,
                orderDate: order.orderDate,
                type: order.items[0].item.type,
                grade: order.items[0].item.grade.name,
                formType: order.items[0].item.formType,
                thickness: order.items[0].item.thickness.name,
                wagonNumber: order.items[0].wagonNumber,
                challanDate: order.items[0].challan.challanDate,
                challanNumber: order.items[0].challan.challanNumber,
            }

            return payload;
        })

        res.status(200).json({
            success: true,
            message: "Successfully fetched your orders",
            orders: allOrders
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const searchOptions = async (req, res) => {
    try {
        const { type, grade, formType, thickness, width, quantity } = req.body;

        // Build dynamic query object - only include fields that are provided
        const query = {};

        if (type) query.type = type;
        if (grade) query.grade = grade;
        if (formType) query.formType = formType;
        if (thickness !== undefined) query.thickness = thickness;
        if (width !== undefined) query.width = width;

        // Always filter for items with remaining quantity > 0
        query.quantity = { $gt: 0 };

        const findAll = await Item.find(query)
            .select('-__v') // Exclude version key
            .sort({ quantity: -1 }) // Sort by remaining quantity (highest first)
            .lean(); // Return plain JavaScript objects for better performance

        // Return appropriate message based on results
        if (findAll.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No items found matching the search criteria",
                allItems: [],
                optimalSuggestions: []
            });
        }

        let optimalSuggestions = [];

        // Only calculate suggestions if quantity is provided
        if (quantity && quantity > 0) {
            // Find all combinations that satisfy the required quantity
            const findCombinations = (requirement, items, index, currentCombination) => {
                // Base case: if we've found an exact match or covered the requirement
                if (requirement <= 0) {
                    if (requirement === 0) {
                        optimalSuggestions.push([...currentCombination]);
                    }
                    return;
                }

                // Base case: if we've exhausted all items
                if (index >= items.length) {
                    return;
                }

                // Include current item (if it doesn't exceed requirement too much)
                // Prevent taking more than needed by a large margin
                if (items[index].remaining <= requirement * 1.5) {
                    findCombinations(
                        requirement - items[index].remaining,
                        items,
                        index + 1,
                        [...currentCombination, items[index]]
                    );
                }

                // Exclude current item and move to next
                findCombinations(requirement, items, index + 1, currentCombination);
            };

            findCombinations(quantity, findAll, 0, []);

            // Sort suggestions by efficiency (fewest items first, then by total remaining)
            optimalSuggestions.sort((a, b) => {
                if (a.length !== b.length) {
                    return a.length - b.length; // Fewer items is better
                }
                const totalA = a.reduce((sum, item) => sum + item.remaining, 0);
                const totalB = b.reduce((sum, item) => sum + item.remaining, 0);
                return totalA - totalB; // Less excess is better
            });

            // Limit to top 10 suggestions to avoid overwhelming response
            optimalSuggestions = optimalSuggestions.slice(0, 10);

            // Add metadata to suggestions
            optimalSuggestions = optimalSuggestions.map(combination => ({
                items: combination,
                totalQuantity: combination.reduce((sum, item) => sum + item.remaining, 0),
                itemCount: combination.length,
                excess: combination.reduce((sum, item) => sum + item.remaining, 0) - quantity
            }));
        }

        res.status(200).json({
            success: true,
            message: `Successfully found ${findAll.length} item(s)`,
            count: findAll.length,
            allItems: findAll,
            optimalSuggestions,
            ...(quantity && { requestedQuantity: quantity })
        });

    } catch (err) {
        console.error('Search error:', err);
        errorResponse(res, err);
    }
};

const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            throw customError("Please select any one order");
        }

        const order = await Order.findByIdAndUpdate(orderId, { status: 'Processing' });

        if (!order) {
            throw customError("Unable to find the order");
        }

        res.status(200).json({
            success: true,
            message: "Successfully confirmed the order"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) throw customError("Please select an order");

        // Get order with item details
        const order = await Order.findById(orderId).populate('items.item');
        if (!order) throw customError("Order not found");

        if (order.status === "Cancelled") {
            throw customError("Order already cancelled");
        }

        // Restore quantities to each item
        for (const orderItem of order.items) {
            const { item, quantity } = orderItem;
            if (!item?._id) continue;

            await Item.findByIdAndUpdate(item._id, {
                $inc: { quantity: quantity }  // add back deducted quantity
            });
        }

        // Update order status
        order.status = "Cancelled";
        order.updatedAt = Date.now();
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const deliverOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            throw customError("Please select any one order");
        }

        const order = await Order.findByIdAndUpdate(orderId, {
            status: 'Delivered'
        })

        if (!order) {
            throw customError('Unable to find the order');
        }

        res.status(200).json({
            success: true,
            message: "Successfully deliver the order"
        })
    }
    catch (err) {
        errorResponse(res, err);
    }
}

module.exports = {
    createOrder,
    updateOrder,
    deleteOrder,
    getOrder,
    getAllOrders,
    getMyOrders,
    searchOptions,
    confirmOrder,
    cancelOrder,
    deliverOrder
}