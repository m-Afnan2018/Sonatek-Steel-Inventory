
const { customError, errorResponse } = require("../utils/errorHandler");
const Order = require("../models/orderModel");
const Item = require("../models/itemModel")
const { v4: uuidv4 } = require('uuid');


const createOrder = async (req, res) => {
    try {
        const { userId } = req.user;
        const { items, requirement } = req.body;

        if (!items || items.length === 0) {
            throw customError("Please select items", 404);
        }

        const allItems = await Promise.all(items.map(id => Item.findById(id)));
        const sum = allItems.reduce((acc, item) => acc + (item?.quantity || 0), 0);

        const newOrder = new Order({
            order_id: uuidv4(),
            item: items,
            quantity: sum,
            requirement,
            orderBy: userId
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

const getAllOrders = async (req, res) => {
    try {

    } catch (err) {
        errorResponse(res, err);
    }
}

const getMyOrders = async (req, res) => {
    try {
        // Fetching
        const { userId } = req.user;

        // Validation
        if (!userId) {
            throw customError("Please relogin", 400);
        }
        const orders = await User.find({ orderBy: userId });

        response.status(200).json({
            success: true,
            message: "Successfully fetched your orders",
            orders
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
        query.remaining = { $gt: 0 };

        const findAll = await Item.find(query)
            .select('-__v') // Exclude version key
            .sort({ remaining: -1 }) // Sort by remaining quantity (highest first)
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

module.exports = {
    createOrder,
    updateOrder,
    deleteOrder,
    getOrder,
    getAllOrders,
    getMyOrders,
    searchOptions
}