
const { customError, errorResponse } = require("../utils/errorHandler");
const Booking = require("../models/bookingModel");
const Item = require("../models/itemModel");
const User = require('../models/userModel')
const { v4: uuidv4 } = require('uuid');

const createBooking = async (req, res) => {
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

        // if (remaining > 0) throw customError("Not enough stock to fulfill requirement", 400);

        const newBooking = await Booking.create({
            booking_id: uuidv4(),
            items: takenItems,
            quantity: totalUsed,
            requirement,
            bookedBy: userId
        })

        const populatedBookings = await Booking.findById(newBooking._id).populate({
            path: 'items.item',
            populate: [
                { path: 'grade', select: 'name' },
                { path: 'thickness', select: 'name' },
            ],
        }).populate({
            path: 'bookedBy'
        });;

        const wagonInfo = populatedBookings.items
            .filter(i => i.item) // safety check
            .map(i => ({
                wagonNumber: i.item.wagonNumber,
                challanNumber: i.item.challan?.challanNumber || "N/A",
                challanDate: i.item.challan?.challanDate || "N/A",
                quantityTaken: i.quantity,
            }));

        const payload = {
            _id: populatedBookings._id,
            quantity: populatedBookings.quantity,
            requirement: populatedBookings.requirement,
            status: populatedBookings.status,
            bookingDate: populatedBookings.bookingDate,
            bookedBy: `${populatedBookings.bookedBy.firstName} ${populatedBookings.bookedBy.lastName}`,
            type: populatedBookings.items[0]?.item.type || "N/A",
            grade: populatedBookings.items[0]?.item.grade?.name || "N/A",
            formType: populatedBookings.items[0]?.item.formType || "N/A",
            thickness: populatedBookings.items[0]?.item.thickness?.name || "N/A",
            vehicleNumber: populatedBookings.vehicleNumber || "N/A",
            wagons: wagonInfo,
        }

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: newBooking,
            item: payload
        });

    } catch (err) {
        errorResponse(res, err);
    }
};


const updateBooking = async (req, res) => {
    try {
        // Fetching Data
        const { id } = req.params;
        const updateData = req.body;

        // Validation

        if (updateData._id) delete updateData._id;

        updateData.updatedAt = Date.now();

        const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedBooking) throw customError('Booking not found', 404);

        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Booking.findByIdAndDelete(id);

        if (!deleted) throw customError('Booking not found', 404);

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const getBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id).populate('item');

        if (!booking) throw customError('Booking not found', 404);

        res.status(200).json({
            success: true,
            booking
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const getAllBookings = async (req, res) => {
    try {
        const { search } = req.body;

        let query = {};

        // 🔍 If there's a search term, filter by booking_id or vehicleNumber
        if (search && search.trim() !== "") {
            query = {
                $or: [
                    { booking_id: { $regex: search, $options: "i" } },
                    { vehicleNumber: { $regex: search, $options: "i" } },
                ],
            };
        }

        const bookings = await Booking.find(query)
            .populate("item", "name quantity") // populate item name & quantity
            .populate("bookingBy", "firstName lastName email") // populate user info
            .sort({ bookingDate: -1 }); // latest first

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const getMyBookings = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) throw customError("Please relogin", 400);

        // Fetch user's bookings and populate item details
        const bookings = await Booking.find({ bookedBy: userId })
            .sort({ bookingDate: -1 })
            .populate({
                path: 'items.item',
                populate: [
                    { path: 'grade', select: 'name' },
                    { path: 'thickness', select: 'name' },
                ],
            })
            .populate({
                path: 'bookedBy'
            });

        const allBookings = bookings.map((booking) => {
            const firstItem = booking.items[0]?.item;

            // Group items by wagon number for this booking
            const wagonInfo = booking.items
                .filter(i => i.item) // safety check
                .map(i => ({
                    wagonNumber: i.item.wagonNumber,
                    challanNumber: i.item.challan?.challanNumber || "N/A",
                    challanDate: i.item.challan?.challanDate || "N/A",
                    quantityTaken: i.quantity,
                }));

            return {
                _id: booking._id,
                quantity: booking.quantity,
                requirement: booking.requirement,
                status: booking.status,
                bookingDate: booking.bookingDate,
                bookedBy: `${booking.bookedBy.firstName} ${booking.bookedBy.lastName}`,
                type: firstItem?.type || "N/A",
                grade: firstItem?.grade?.name || "N/A",
                formType: firstItem?.formType || "N/A",
                thickness: firstItem?.thickness?.name || "N/A",
                vehicleNumber: booking.vehicleNumber || "N/A",
                wagons: wagonInfo,
            };
        });

        res.status(200).json({
            success: true,
            message: "Successfully fetched your bookings",
            bookings: allBookings,
        });
    } catch (err) {
        errorResponse(res, err);
    }
};


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

const confirmBooking = async (req, res) => {
    try {
        const { bookingId, orderId } = req.body;

        if (!bookingId) {
            throw customError("Please select any one booking");
        }

        const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'Processing', order_id: orderId });

        if (!booking) {
            throw customError("Unable to find the booking");
        }

        res.status(200).json({
            success: true,
            message: "Successfully confirmed the booking"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) throw customError("Please select an booking");

        // Get booking with item details
        const booking = await Booking.findById(bookingId).populate('items.item');
        if (!booking) throw customError("Booking not found");

        if (booking.status === "Cancelled") {
            throw customError("Booking already cancelled");
        }

        // Restore quantities to each item
        for (const bookingItem of booking.items) {
            const { item, quantity } = bookingItem;
            if (!item?._id) continue;

            await Item.findByIdAndUpdate(item._id, {
                $inc: { quantity: quantity }  // add back deducted quantity
            });
        }

        // Update booking status
        booking.status = "Cancelled";
        booking.updatedAt = Date.now();
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

const deliverBooking = async (req, res) => {
    try {
        const { bookingId, vehicle_number } = req.body;

        if (!bookingId) {
            throw customError("Please select any one booking");
        }

        const booking = await Booking.findByIdAndUpdate(bookingId, {
            status: 'Delivered',
            vehicleNumber: vehicle_number
        })

        if (!booking) {
            throw customError('Unable to find the booking');
        }

        res.status(200).json({
            success: true,
            message: "Successfully deliver the booking"
        })
    }
    catch (err) {
        errorResponse(res, err);
    }
}

const getAllBookingsDetails = async (req, res) => {
    try {
        // Fetch all bookings with related details populated
        const bookings = await Booking.find({})
            .populate("bookedBy", "firstName lastName email role")
            .populate({
                path: "items.item",
                select: "type formType grade thickness width wagonNumber challan quantity currentStatus",
                populate: [
                    { path: "grade", select: "name" },
                    { path: "thickness", select: "name" },
                    { path: "width", select: "name" },
                ],
            })
            .sort({ bookingDate: -1 }); // latest first

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No bookings found",
                data: { total: 0, bookings: [] },
            });
        }

        // Summary counts by status
        const summary = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === "Pending").length,
            processing: bookings.filter(b => b.status === "Processing").length,
            delivered: bookings.filter(b => b.status === "Delivered").length,
            cancelled: bookings.filter(b => b.status === "Cancelled").length,
        };

        // Optional: group by bookedBy (for reports)
        const agentsSummary = {};
        bookings.forEach(b => {
            const agent = b.bookedBy?.firstName || "Unknown";
            if (!agentsSummary[agent]) {
                agentsSummary[agent] = { totalBookings: 0, totalQuantity: 0 };
            }
            agentsSummary[agent].totalBookings += 1;
            agentsSummary[agent].totalQuantity += b.quantity;
        });

        res.status(200).json({
            success: true,
            message: "Fetched all bookings successfully",
            data: {
                summary,
                agents: agentsSummary,
                bookings,
            },
        });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        errorResponse(res, err);
    }
};


module.exports = {
    createBooking,
    updateBooking,
    deleteBooking,
    getBooking,
    getAllBookings,
    getMyBookings,
    searchOptions,
    confirmBooking,
    cancelBooking,
    deliverBooking,
    getAllBookingsDetails
}