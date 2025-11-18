
const { customError, errorResponse } = require("../utils/errorHandler");
const Booking = require("../models/bookingModel");
const Item = require("../models/itemModel");
const User = require('../models/userModel')
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
const { default: mongoose } = require("mongoose");
const Party = require("../models/partyModel");

const createBooking = async (req, res) => {
    try {
        const { userId } = req.user;
        const { items } = req.body;
        const { party, shipTo } = req.body;

        let selectedParty;
        if (party.type === 'id') {
            selectedParty = await Party.findById(party.val);
        } else {
            const tempParty = new Party({ name: party.val });
            const temp = await tempParty.save();
            selectedParty = temp;
        }

        if (!selectedParty) {
            throw customError("Select the party first");
        }

        if (!items?.length) throw customError("Please select items", 400);

        const allItemsId = items.map(i => i.id);
        const allItems = await Item.find({ _id: { $in: allItemsId } })
            .populate('thickness warehouse grade width');

        const takenItems = [];

        for (const i of items) {
            const item = allItems.find(x => x._id.toString() === i.id);
            if (!item) continue;

            const qty = Number(i.quantity);
            if (isNaN(qty) || qty <= 0) continue;

            if (qty > item.quantity)
                throw customError(`Not enough stock in item ${item._id}`, 400);

            // reduce stock
            item.quantity -= qty;
            await item.save();

            const formType = i.formType;

            takenItems.push({
                item: item._id,
                quantity: qty,
                formType: formType,
                itemSnapshot: Booking.makeItemSnapshot(item)
            });
        }

        if (!takenItems.length)
            throw customError("No valid items found for booking", 400);

        // user snapshot
        const userDoc = await User.findById(userId).select('firstName lastName email phone role name fullName');
        const bookedBySnapshot = Booking.makeBookedBySnapshot(userDoc ? {
            _id: userDoc._id,
            name: userDoc.name || `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim(),
            email: userDoc.email,
            phone: userDoc.phone,
            role: userDoc.role
        } : null);

        const totalQty = takenItems.reduce((sum, it) => sum + it.quantity, 0);

        let newBooking = new Booking({
            booking_id: uuidv4(),
            items: takenItems,
            quantity: totalQty,
            bookedBy: userId,
            bookedBySnapshot,
            shipTo: shipTo,
            status: "Processing",
            party: selectedParty._id,
            partySnapshot: Booking.makePartySnapshot(selectedParty)
        });
        newBooking = await newBooking.save();

        const populatedBooking = await Booking.findById(newBooking._id)
            .populate({
                path: 'items.item',
                populate: [
                    { path: 'grade', select: 'name' },
                    { path: 'thickness', select: 'name' },
                    { path: 'width', select: 'name' },
                ],
            })
            .populate('bookedBy');

        const wagonInfo = populatedBooking.items.map(i => {
            const src = i.item || i.itemSnapshot || {};
            return {
                wagonNumber: src.wagonNumber || "N/A",
                challanNumber: src.challan?.challanNumber || src.challanNumber || "N/A",
                challanDate: src.challan?.challanDate || src.challanDate || "N/A",
                quantityTaken: i.quantity,
                formType: i.formType,
            };
        });

        const payload = {
            _id: populatedBooking._id,
            quantity: populatedBooking.quantity,
            status: populatedBooking.status,
            bookingDate: populatedBooking.bookingDate,
            order_id: populatedBooking.order_id,
            bookedBy:
                (populatedBooking.bookedBy && `${populatedBooking.bookedBy.firstName} ${populatedBooking.bookedBy.lastName}`) ||
                populatedBooking.bookedBySnapshot?.name ||
                "N/A",
            wagons: wagonInfo,
        };

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: populatedBooking,
            item: payload,
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

const updateRemark = async (req, res) => {
    try {
        const { bookingId, remark } = req.body;

        if (!bookingId) {
            throw customError("Please select any one booking");
        }

        const booking = await Booking.findByIdAndUpdate(bookingId, { description: remark });

        if (!booking) {
            throw customError("Unable to find the booking");
        }

        res.status(200).json({
            success: true,
            message: "Successfully update the booking"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

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
        const search = req?.body?.search || null;

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

        // const bookings = await Booking.find(query)
        //     .populate("item", "name quantity") // populate item name & quantity
        //     .populate("bookingBy", "firstName lastName email") // populate user info
        //     .sort({ bookingDate: -1 }); // latest first

        const bookings = await Booking.find(query)
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
                bookedBy: `${booking.bookedBy?.firstName} ${booking.bookedBy?.lastName}`,
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
            message: "Successfully fetch all the bookings",
            count: bookings.length,
            bookings: allBookings,
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
        const { type, grade, formType, thickness, width, warehouse, quantity } = req.body;

        // Build dynamic query object - only include fields that are provided
        const query = {};

        if (type) query.type = type;
        if (grade) query.grade = grade;
        if (formType) query.formType = formType;
        if (thickness !== undefined) query.thickness = thickness;
        if (width !== undefined) query.width = width;
        if (warehouse !== undefined) query.warehouse = warehouse;

        // Always filter for items with remaining quantity > 0
        query.quantity = { $gt: 0 };

        const findAll = await Item.find(query)
            .select('-__v') // Exclude version key
            .sort({ quantity: -1 }) // Sort by remaining quantity (highest first)
            .populate('warehouse thickness width grade')
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

const shippedBooking = async (req, res) => {
    try {
        const { bookingId, fieldValue } = req.body;

        if (!bookingId) {
            throw customError("Please select any one booking");
        }

        const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'Shipped', vehicleNumber: fieldValue });

        if (!booking) {
            throw customError("Unable to find the booking");
        }

        res.status(200).json({
            success: true,
            message: "Successfully shipped the booking"
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

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
        const { bookingId, reason } = req.body;
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
                $inc: { quantity: quantity, description: reason }  // add back deducted quantity
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
        const { role } = req.user;

        let query = {};
        if (role === 'agent') {
            query = { bookedBy: role.userId }
        }

        // Fetch all bookings with related details populated
        let bookings = await Booking.find(query)
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

const getAllIncompleteBookingsDetails = async (req, res) => {
    try {
        const { role } = req.user;

        // Base query for incomplete statuses
        let query = {
            status: { $in: ["Pending", "Processing"] },
        };

        // Restrict to agent's bookings if applicable
        if (role === "agent") {
            query.bookedBy = role.userId;
        }

        // Fetch all bookings with related details populated
        let bookings = await Booking.find(query)
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

// const getAllBookingDetailsTablewise = async (req, res) => {
//     try {
//         console.log("Here")
//         const {
//             search,
//             sortBy = "bookingDate",
//             order = "desc",
//             page = 1,
//             limit = 50,
//             filters = null,
//         } = req.body;

//         const skip = (Number(page) - 1) * Number(limit);

//         // base query
//         const query = {};

//         // -----------------------
//         // SEARCH: top-level and inside snapshots
//         // -----------------------
//         if (search && typeof search === "string" && search.trim() !== "") {
//             const s = search.trim();
//             // search across booking fields, bookedBySnapshot.name, and item snapshots
//             query.$or = [
//                 { booking_id: { $regex: s, $options: "i" } },
//                 { order_id: { $regex: s, $options: "i" } },
//                 { vehicleNumber: { $regex: s, $options: "i" } },
//                 { status: { $regex: s, $options: "i" } },
//                 { "bookedBySnapshot.name": { $regex: s, $options: "i" } },
//                 { "items.itemSnapshot.grade": { $regex: s, $options: "i" } },
//                 { "items.itemSnapshot.wagonNumber": { $regex: s, $options: "i" } },
//                 { "items.itemSnapshot.challan.challanNumber": { $regex: s, $options: "i" } },
//                 { "items.itemSnapshot.type": { $regex: s, $options: "i" } },
//                 { "items.itemSnapshot.formType": { $regex: s, $options: "i" } },
//             ];
//         }

//         // -----------------------
//         // FILTERS: status, bookingDate range, bookedBy, itemSnapshot properties
//         // -----------------------
//         if (filters && typeof filters === "object") {
//             // status filter (exact match or array)
//             if (filters.status) {
//                 if (Array.isArray(filters.status)) {
//                     query.status = { $in: filters.status };
//                 } else {
//                     query.status = filters.status;
//                 }
//             }

//             // bookingDate range: fromDate/toDate expected as ISO or yyyy-mm-dd
//             const { fromDate, toDate } = filters;
//             if (fromDate || toDate) {
//                 query.bookingDate = {};
//                 if (fromDate) {
//                     const from = new Date(fromDate);
//                     from.setHours(0, 0, 0, 0);
//                     query.bookingDate.$gte = from;
//                 }
//                 if (toDate) {
//                     const to = new Date(toDate);
//                     to.setHours(23, 59, 59, 999);
//                     query.bookingDate.$lte = to;
//                 }
//             }

//             // bookedBy: can be user id or name
//             if (filters.bookedBy) {
//                 const bv = filters.bookedBy;
//                 // if looks like ObjectId -> match bookedBy ref OR snapshot.user_id
//                 if (mongoose.Types.ObjectId.isValid(String(bv))) {
//                     query.$or = query.$or || [];
//                     query.$or.push({ bookedBy: mongoose.Types.ObjectId(String(bv)) });
//                     query.$or.push({ "bookedBySnapshot.user_id": mongoose.Types.ObjectId(String(bv)) });
//                 } else {
//                     query["bookedBySnapshot.name"] = { $regex: bv, $options: "i" };
//                 }
//             }

//             // itemSnapshot-level filters (grade, wagonNumber, challanNumber, type, formType)
//             const itemKeys = ["grade", "wagonNumber", "type", "formType", "width", "thickness"];
//             itemKeys.forEach((k) => {
//                 if (filters[k]) {
//                     // use $elemMatch to filter bookings that have at least one item matching
//                     query.items = query.items || {};
//                     query.items.$elemMatch = query.items.$elemMatch || {};
//                     // nested fields under items.itemSnapshot
//                     query.items.$elemMatch[`itemSnapshot.${k}`] = { $regex: filters[k], $options: "i" };
//                 }
//             });

//             // challanNumber filter (nested)
//             if (filters.challanNumber) {
//                 query.items = query.items || {};
//                 query.items.$elemMatch = query.items.$elemMatch || {};
//                 query.items.$elemMatch["itemSnapshot.challan.challanNumber"] = {
//                     $regex: filters.challanNumber,
//                     $options: "i",
//                 };
//             }

//             // remaining custom filters could be added similarly if needed
//         }

//         // -----------------------
//         // FETCH bookings
//         // -----------------------
//         // Build mongo sort object
//         const sortObj = {};
//         sortObj[sortBy] = order === "asc" ? 1 : -1;

//         // If user wants to sort by bookedBy (snapshot name), we'll fetch and do client-side sort after populate.
//         const needsClientSideBookedBySort = sortBy === "bookedBy";

//         // Query: find -> populate -> skip/limit
//         let bookingsQuery = Booking.find(query)
//             .populate("bookedBy") // populate ref for convenience
//             .skip(skip)
//             .limit(Number(limit));

//         // Apply DB-side sort only when not doing bookedBy client-side sort
//         if (!needsClientSideBookedBySort) bookingsQuery = bookingsQuery.sort(sortObj);

//         let bookings = await bookingsQuery.exec();

//         // total count
//         const total = await Booking.countDocuments(query);

//         // client-side sort by bookedBy snapshot name if requested
//         if (needsClientSideBookedBySort) {
//             const dir = order === "asc" ? 1 : -1;
//             bookings = bookings.sort((a, b) => {
//                 const A = (a.bookedBySnapshot?.name || a.bookedBy?.name || "").toLowerCase();
//                 const B = (b.bookedBySnapshot?.name || b.bookedBy?.name || "").toLowerCase();
//                 if (A < B) return -1 * dir;
//                 if (A > B) return 1 * dir;
//                 return 0;
//             });
//         }

//         // -----------------------
//         // Build listView
//         // -----------------------
//         const listView = bookings.map((b) => ({
//             _id: b._id,
//             booking_id: b.booking_id,
//             order_id: b.order_id,
//             status: b.status,
//             quantity: b.quantity,
//             requirement: b.requirement,
//             vehicleNumber: b.vehicleNumber,
//             bookedBy: {
//                 _id: b.bookedBySnapshot?.user_id || (b.bookedBy?._id || null),
//                 name: b.bookedBySnapshot?.name || b.bookedBy?.name || null,
//                 email: b.bookedBySnapshot?.email || b.bookedBy?.email || null,
//                 phone: b.bookedBySnapshot?.phone || b.bookedBy?.phone || null,
//             },
//             bookingDate: b.bookingDate,
//             deliveryDate: b.deliveryDate,
//             description: b.description,
//             itemsCount: Array.isArray(b.items) ? b.items.length : 0,
//             items: (b.items || []).map((it) => ({
//                 itemRef: it.item || null,
//                 quantity: it.quantity,
//                 // itemSnapshot fields (snapshot ensures stable data)
//                 grade: it.itemSnapshot?.grade || null,
//                 type: it.itemSnapshot?.type || null,
//                 formType: it.itemSnapshot?.formType || null,
//                 width: it.itemSnapshot?.width || null,
//                 thickness: it.itemSnapshot?.thickness || null,
//                 wagonNumber: it.itemSnapshot?.wagonNumber || null,
//                 challanNumber: it.itemSnapshot?.challan?.challanNumber || null,
//                 challanDate: it.itemSnapshot?.challan?.challanDate || null,
//                 currentStatus: it.itemSnapshot?.currentStatus || null,
//                 warehouse: it.itemSnapshot?.warehouse || null,
//             })),
//             createdAt: b.createdAt || b.bookingDate || null,
//             updatedAt: b.updatedAt || null,
//         }));

//         res.status(200).json({
//             success: true,
//             message: "Successfully fetched bookings",
//             total,
//             page: Number(page),
//             pages: Math.ceil(total / Number(limit)),
//             listView,
//         });
//     } catch (error) {
//         console.error("getAllBookings error:", error);
//         res.status(500).json({ success: false, message: error.message || "Server error" });
//     }
// }

const getAllBookingDetailsTablewise = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            search = "",
            filters = {},
            sortBy = "orderDate",
            order = "desc",
        } = req.body;

        const query = {};


        const toObjectId = (id) => {
            if (!id) return null;
            try {
                return new mongoose.Types.ObjectId(id);
            } catch (err) {
                return null;
            }
        };

        // 🔎 Search
        if (search) {
            query.$or = [
                { order_id: { $regex: search, $options: "i" } },
                { "bookedBySnapshot.name": { $regex: search, $options: "i" } },
                { vehicleNumber: { $regex: search, $options: "i" } },
                { status: { $regex: search, $options: "i" } },
                { "items.itemSnapshot.grade": { $regex: search, $options: "i" } },
            ];
        }

        // 🎯 Combined Filters
        const itemMatch = {};

        if (filters.grade) itemMatch["itemSnapshot.grade._id"] = toObjectId(filters.grade);
        if (filters.type) itemMatch["itemSnapshot.type"] = filters.type;
        if (filters.width) itemMatch["itemSnapshot.width._id"] = toObjectId(filters.width);
        if (filters.thickness) itemMatch["itemSnapshot.thickness._id"] = toObjectId(filters.thickness);
        if (filters.formType) itemMatch["itemSnapshot.formType"] = filters.formType;
        if (filters.warehouse)
            itemMatch["itemSnapshot.warehouse._id"] = toObjectId(filters.warehouse);

        if (Object.keys(itemMatch).length > 0) {
            query.items = { $elemMatch: itemMatch };
        }

        // ✅ Other top-level filters
        if (filters.status) query.status = filters.status;
        if (filters.bookedBy)
            query["bookedBySnapshot.user_id"] = toObjectId(filters.bookedBy);


        if (filters.party) {
            query["partySnapshot.party_id"] = filters.party;
        }

        // 📅 Date range
        if (filters.fromDate || filters.toDate) {
            query.bookingDate = {};
            if (filters.fromDate) query.bookingDate.$gte = new Date(filters.fromDate);
            if (filters.toDate) {
                const end = new Date(filters.toDate);
                end.setHours(23, 59, 59, 999);
                query.bookingDate.$lte = end;
            }
        }

        // 🔍 Fetch from DB
        const bookings = await Booking.find(query)
            .sort(sortBy === "materialDescription" ? {} : { [sortBy]: order === "asc" ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Booking.countDocuments(query);

        // 🧾 Transform result
        // const listView = bookings.map((b) => ({
        //     _id: b._id,
        //     orderId: b.order_id,
        //     bookedBy: b.bookedBySnapshot?.name,
        //     bookingDate: b.bookingDate,
        //     form: b.items?.[0].formType || "-",
        //     type: b.items?.[0]?.itemSnapshot?.type || "-",
        //     thickness: b.items?.[0]?.itemSnapshot?.thickness || "-",
        //     width: b.items?.[0]?.itemSnapshot?.width || "-",
        //     grade: b.items?.[0]?.itemSnapshot?.grade || "-",
        //     quantity: b.items?.[0]?.quantity,
        //     requirement: b.requirement,
        //     status: b.status,
        //     vehicleNumber: b.vehicleNumber,
        //     warehouse: b.items?.[0]?.itemSnapshot?.warehouse?.name || "-",
        //     remark: b.description || "-",
        //     party: b.partySnapshot?.name || "-",
        // }));

        const listView = bookings.map((b) => ({
            _id: b._id,
            orderId: b.order_id || ' - ',
            bookedBy: b.bookedBySnapshot?.name,
            bookingDate: b.bookingDate,
            items: b.items,
            requirement: b.requirement,
            status: b.status,
            vehicleNumber: b.vehicleNumber,
            remark: b.description || "-",
            party: b.partySnapshot?.name || "-",
        }));

        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            page,
            pages: Math.ceil(total / limit),
            total,
            listView,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getExcelTablewiseBooking = async (req, res) => {
    try {
        const {
            filters = {},
            search,
            sortBy = "orderDate",
            order = "desc",
        } = req.body;

        const query = {};

        // 🔎 Search
        if (search) {
            query.$or = [
                { order_id: { $regex: search, $options: "i" } },
                { "bookedBySnapshot.name": { $regex: search, $options: "i" } },
                { vehicleNumber: { $regex: search, $options: "i" } },
                { status: { $regex: search, $options: "i" } },
                { "items.itemSnapshot.grade": { $regex: search, $options: "i" } }
            ];
        }

        // 🎯 Filters
        // 🎯 Filters (✅ FIXED)
        if (filters.grade) {
            query.items = { $elemMatch: { "itemSnapshot.grade": filters.grade } };
        }

        if (filters.type) {
            query.items = { $elemMatch: { "itemSnapshot.type": filters.type } };
        }

        if (filters.width) {
            query.items = { $elemMatch: { "itemSnapshot.width": filters.width } };
        }

        if (filters.thickness) {
            query.items = { $elemMatch: { "itemSnapshot.thickness": filters.thickness } };
        }

        if (filters.formType) {
            query.items = { $elemMatch: { "itemSnapshot.formType": filters.formType } };
        }

        if (filters.warehouse) {
            query.items = { $elemMatch: { "itemSnapshot.warehouse.warehouse_id": filters.warehouse } };
        }

        if (filters.party) {
            query["partySnapshot.party_id"] = filters.party;
        }

        // ✅ Status
        if (filters.status) query.status = filters.status;

        // ✅ BookedBy user filter
        if (filters.bookedBy) query["bookedBySnapshot.user_id"] = filters.bookedBy;

        // 📅 Filter by booking date
        if (filters.fromDate || filters.toDate) {
            query.bookingDate = {};
            if (filters.fromDate) query.bookingDate.$gte = new Date(filters.fromDate);
            if (filters.toDate) {
                const end = new Date(filters.toDate);
                end.setHours(23, 59, 59, 999);
                query.bookingDate.$lte = end;
            }
        }

        const bookings = await Booking.find(query).sort(sortBy === "materialDescription" ? {} : { [sortBy]: order === "asc" ? 1 : -1 })

        const total = await Booking.countDocuments(query);

        // ✅ Convert to frontend table format
        const listView = [];

        bookings.map(b => {
            b.items.map((item) => {
                let temp = {
                    order_id: b.order_id,
                    party: b.partySnapshot?.name || "-",
                    bookedBy: b.bookedBySnapshot?.name,
                    bookingDate: b.bookingDate,
                    form: item.itemSnapshot?.formType || "-",
                    type: item.itemSnapshot?.type || "-",
                    description: `${item.itemSnapshot?.thickness?.name || "-"} X ${item.itemSnapshot?.width?.name || "-"} X ${item.itemSnapshot?.grade?.name || "-"}`,
                    quantity: item.quantity,
                    status: b.status,
                    vehicleNumber: b.vehicleNumber,
                    location: item.itemSnapshot?.warehouse?.name || "-",
                    remark: b.description || '-'
                }
                listView.push(temp);
            })
        });
        // Create workbook and sheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listView);

        // Optional: set column widths
        worksheet["!cols"] = [
            { wch: 12 }, // OrderID
            { wch: 12 }, // BookedBy
            { wch: 14 }, // BookedDate
            { wch: 16 }, // Form
            { wch: 10 }, // Type
            { wch: 30 }, // Description
            { wch: 12 }, // Quantity
            { wch: 14 }, // Requirement
            { wch: 12 }, // Status
            { wch: 12 }, // Vehicle Number
            { wch: 12 }, // Location
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

        const excelBuffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=bookings-${Date.now()}.xlsx`
        );
        res.setHeader("Content-Length", excelBuffer.length);

        res.send(excelBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const getExcelBooking = async (req, res) => {
    try {
        // Fetch all bookings (no populate needed; data is inside snapshots)
        const bookings = await Booking.find().lean();

        // Flatten items so each booked item becomes one Excel row
        const payload = bookings.flatMap((booking) =>
            booking.items.map((it) => {
                const snap = it.itemSnapshot || {};
                return {
                    Date: booking.bookingDate
                        ? new Date(booking.bookingDate).toISOString().split("T")[0]
                        : "N/A",
                    ChallanDate: snap.challan?.challanDate
                        ? new Date(snap.challan.challanDate).toISOString().split("T")[0]
                        : "N/A",
                    ChallanNumber: snap.challan?.challanNumber || "N/A",
                    Weight: it.quantity || "N/A",
                    Description: `${snap.type || ""} X ${snap.grade || "N/A"} X ${snap.thickness || "N/A"
                        } ${snap.width || "N/A"}`,
                    Warehouses: snap.warehouse?.name || "N/A",
                    WagonNumber: snap.wagonNumber || "N/A",
                    Status: snap.currentStatus || booking.status || "N/A",
                };
            })
        );

        // Create workbook and sheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(payload);

        // Optional: set column widths
        worksheet["!cols"] = [
            { wch: 12 }, // Date
            { wch: 14 }, // ChallanDate
            { wch: 16 }, // ChallanNumber
            { wch: 10 }, // Weight
            { wch: 30 }, // Description
            { wch: 12 }, // Warehouses
            { wch: 14 }, // WagonNumber
            { wch: 12 }, // Status
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

        const excelBuffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=bookings-${Date.now()}.xlsx`
        );
        res.setHeader("Content-Length", excelBuffer.length);

        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({
            message: "Error generating Excel file",
            error: error.message,
        });
    }
};

const getAllParty = async (req, res) => {
    try {
        const parties = await Party.find();

        res.status(200).json({
            success: true,
            message: "Successfully fetched all parties",
            parties
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const deleteParty = async (req, res) => {
    try {
        const { id } = req.body;

        await Party.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Successfully delete the party",
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const getAllPartyDetails = async (req, res) => {
    try {
        const parties = await Party.find();

        // Count bookings for each party
        const bookingCounts = await Booking.aggregate([
            {
                $group: {
                    _id: "$partySnapshot.party_id", // change this according to your schema
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert aggregation result to a lookup object
        const countsMap = bookingCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Attach booking count to each party
        const partiesWithCounts = parties.map(party => ({
            ...party.toObject(),
            totalBookings: countsMap[party._id] || 0
        }));

        res.status(200).json({
            success: true,
            message: "Successfully fetched all parties",
            parties: partiesWithCounts
        });

    } catch (err) {
        errorResponse(res, err);
    }
};



module.exports = {
    createBooking,
    updateBooking,
    updateRemark,
    deleteBooking,
    getBooking,
    getAllBookings,
    getMyBookings,
    searchOptions,
    confirmBooking,
    shippedBooking,
    cancelBooking,
    deliverBooking,
    getAllBookingsDetails,
    getExcelBooking,
    getExcelTablewiseBooking,
    getAllBookingDetailsTablewise,
    getAllIncompleteBookingsDetails,
    getAllParty,
    deleteParty,
    getAllPartyDetails
}