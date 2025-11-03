
const { customError, errorResponse } = require("../utils/errorHandler");
const Item = require("../models/itemModel");
const Thickness = require('../models/thicknessModel')
const Cutter = require('../models/cutterModel')
const Grade = require('../models/gradeModel')
const Width = require('../models/widthModel')

const addItem = async (req, res) => {
    try {
        // Fetching
        const { type, grade, width, thickness, quantity, shipTo, wagonNumber, date } = req.body;

        // Validation
        if (!type || !grade || !width || !thickness || !quantity) {
            throw customError('All fields are required', 400);
        }
        let cutterChecker = true;
        if (shipTo && shipTo.trim() !== "") {
            cutterChecker = await Cutter.findById(shipTo);
        }
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
            width,
            thickness,
            shipTo: shipTo && shipTo.trim() === "" ? null : shipTo,
            quantity,
            originalQuantity: quantity,
            wagonNumber: wagonNumber || null,
            date: date
        });

        const item = await newItem.save({ new: true });

        const wagon = item.wagonNumber || "Unknown Wagon";

        // let grouped;

        // if (!grouped[wagon]) {
        //     grouped[wagon] = {
        //         wagonNumber: wagon,
        //         items: [],
        //     };
        // }

        let formattedResponse = ({
            name: `${item.thickness.name} X ${item.width.name} X ${item.grade.name}`,
            data: {
                _id: item._id,
                type: item.type,
                grade: item.grade?.name,
                width: item.width?.name,
                thickness: item.thickness?.name,
                quantity: item.originalQuantity,
                challanNumber: item.challan?.challanNumber,
                challanDate: item.challan?.challanDate,
                shipTo: item.shipTo?.name,
                createdAt: item.createdAt,
                date: item.date
            }
        });

        // const formattedResponse = Object.values(grouped);

        const formattedItems = {
            _id: item._id,
            name: `${item.wagonNumber} - ${item.type}`,
            type: item.type,
            grade: gradeChecker,
            width: widthChecker,
            originalQuantity: item.originalQuantity,
            wagonNumber: item.wagonNumber,
            challanNumber: item.challan?.challanNumber,
            challanDate: item.challan?.challanDate,
            thickness: thicknessChecker,
            shipTo: cutterChecker === true ? null : cutterChecker,
            createdAt: item.createdAt,
            date: item.date
        };

        res.status(201).json({
            success: true,
            message: "Item added successfully",
            item: formattedResponse,
            listView: formattedItems
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

        if (updateData?.shipTo?.trim() === "") {
            updateData.shipTo = null;
        }

        // If challan fields are present, nest them
        if (updateData.challanNumber || updateData.challanDate) {
            updateData.challan = {
                challanNumber: updateData.challanNumber,
                challanDate: updateData.challanDate
            };
            delete updateData.challanNumber;
            delete updateData.challanDate;
        }

        // If transport fields are present, nest them
        if (updateData.vehicleNumber || updateData.loader || updateData.transport) {
            updateData.transport = {
                vehicleNumber: updateData.vehicleNumber,
                loader: updateData.loader,
                transporterName: updateData.transporterName
            };
            delete updateData.vehicleNumber;
            delete updateData.loader;
            delete updateData.transporterName;
        }

        updateData.updatedAt = Date.now();

        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true })
            .populate("grade width thickness shipTo");
        if (!updatedItem) throw customError('Item not found', 404);

        const formattedItems = {
            _id: updatedItem._id,
            name: `${updatedItem.wagonNumber} - ${updatedItem.type}`,
            type: updatedItem.type,
            grade: updatedItem.grade,
            width: updatedItem.width,
            remaining: updatedItem.remaining,
            thickness: updatedItem.thickness,
            createdAt: updatedItem.createdAt,
            wagonNumber: updatedItem.wagonNumber,
            challanNumber: updatedItem?.challan?.challanNumber,
            challanDate: updatedItem?.challan?.challanDate,
            shipTo: updatedItem?.shipTo,
            originalQuantity: updatedItem.originalQuantity,
            vehicleNumber: updatedItem?.transport?.vehicleNumber,
            loader: updatedItem?.transport?.loader,
            transporterName: updatedItem?.transport?.transporterName,
            date: updatedItem.date
        };

        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            listView: formattedItems
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
            message: "Successfully fetched the Item",
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
            filters = null,
        } = req.body;

        let query = {};
        query['challan.challanNumber'] = { $ne: null };

        // 🔍 Search
        if (search) {
            query.$or = [
                { type: { $regex: search, $options: "i" } },
                { wagonNumber: { $regex: search, $options: "i" } },
                { formType: { $regex: search, $options: "i" } },
                { "challan.challanNumber": { $regex: search, $options: "i" } },
            ];
        }

        // 🎯 Filters
        if (filters) {
            // handle remaining first
            if (filters.remaining) {
                if (filters.remaining === "remaining") {
                    query.quantity = { $gt: 0 };
                } else if (filters.remaining === "finished") {
                    query.quantity = 0;
                }
            }

            // handle date range
            const { fromDate, toDate } = filters;
            if (fromDate || toDate) {
                const range = {};
                if (fromDate) {
                    const from = new Date(fromDate);
                    from.setHours(0, 0, 0, 0);
                    range.$gte = from;
                }
                if (toDate) {
                    const to = new Date(toDate);
                    to.setHours(23, 59, 59, 999);
                    range.$lte = to;
                }
                query["challan.challanDate"] = range;
            }

            const skipKeys = new Set(["remaining", "fromDate", "toDate"]);
            Object.keys(filters).forEach((key) => {
                if (skipKeys.has(key)) return;
                const value = filters[key];
                if (!value) return;

                // apply regex search only for pure string filters
                if (["type", "formType"].includes(key)) {
                    query[key] = { $regex: value, $options: "i" };
                }
                else if (key === "wagonNumber") {
                    // in case wagonNumber is number-like (not string)
                    if (isNaN(value)) {
                        query[key] = { $regex: value, $options: "i" };
                    } else {
                        query[key] = Number(value);
                    }
                }
                else if (key === "shipTo") {
                    // shipTo is likely ObjectId
                    query[key] = value;
                }
                else if (key === "challanNumber") {
                    // nested string field
                    query["challan.challanNumber"] = { $regex: value, $options: "i" };
                }
                else {
                    // default exact match
                    query[key] = value;
                }
            });
        }

        const skip = (page - 1) * limit;

        // Fetch items
        let items = await Item.find(query)
            .populate("grade width thickness shipTo transport")
            .sort(sortBy === "materialDescription" ? {} : { [sortBy]: order === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Item.countDocuments(query);

        // 📦 Sort manually when sorting by "materialDescription"
        if (sortBy === "materialDescription") {
            items = items.sort((a, b) => {
                const dir = order === "asc" ? 1 : -1;
                const gradeA = a.grade?.name?.toLowerCase() || "";
                const gradeB = b.grade?.name?.toLowerCase() || "";
                const thickA = a.thickness?.name?.toString() || "";
                const thickB = b.thickness?.name?.toString() || "";
                const widthA = a.width?.name?.toString() || "";
                const widthB = b.width?.name?.toString() || "";

                // Compare in order: grade → thickness → width
                if (gradeA !== gradeB) return gradeA > gradeB ? dir : -dir;
                if (thickA !== thickB) return thickA > thickB ? dir : -dir;
                if (widthA !== widthB) return widthA > widthB ? dir : -dir;
                return 0;
            });
        }

        // 🧩 Build listView
        const listView = items.map((item) => ({
            _id: item._id,
            wagonNumber: item.wagonNumber,
            challanNumber: item?.challan?.challanNumber,
            challanDate: item?.challan?.challanDate,
            type: item.type,
            grade: item.grade,
            width: item.width,
            originalQuantity: Number(item.originalQuantity),
            thickness: item.thickness,
            shipTo: item?.shipTo,
            createdAt: item.createdAt,
            transporterName: item.transport?.transporterName,
            loader: item.transport?.loader,
            vehicleNumber: item.transport?.vehicleNumber,
            remaining: item.quantity,
            date: item.date
        }));

        // ✅ NEW: total quantity of all filtered items
        // ✅ simple fallback: fetch all matching docs (no limit) and sum in JS
        const qtyDocs = await Item.find(query).select("originalQuantity").lean();
        const totalQuantity = qtyDocs.reduce((sum, d) => sum + (d.originalQuantity || 0), 0);

        res.status(200).json({
            success: true,
            message: "Successfully fetched grouped items",
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            listView,
            totalQuantity: totalQuantity.toFixed(3),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getItemByWagons = async (req, res) => {
    try {

    } catch (err) {
        errorResponse(res, err);
    }
}

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
                name: value.name,
                type: value.type
            })
            returnValue = await newThickness.save();
        } else if (type === 'grade') {
            const newGrade = new Grade({
                name: value.name,
                type: value.type
            })
            returnValue = await newGrade.save();
        } else if (type === 'width') {
            const newWidth = new Width({
                name: value.name,
                type: value.type
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
            message: "Successfully fetched the varients",
            cutters,
            grades,
            thickness,
            widths
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

const getAllDetailVarient = async (req, res) => {
    try {
        // Function to get total items & total quantity per variant
        const getVariantWithItemStats = async (Model, field) => {
            return await Model.aggregate([
                {
                    $lookup: {
                        from: "items", // collection name in MongoDB
                        localField: "_id",
                        foreignField: field, // field in items (e.g. shipTo, grade, etc.)
                        as: "items",
                    },
                },
                {
                    $project: {
                        name: 1,
                        totalItems: { $size: "$items" },
                        totalQuantity: {
                            $sum: {
                                $map: {
                                    input: "$items",
                                    as: "item",
                                    in: "$$item.quantity"
                                }
                            }
                        }
                    },
                },
            ]);
        };

        // Run in parallel
        const [cutters, grades, thicknesses, widths] = await Promise.all([
            getVariantWithItemStats(Cutter, "shipTo"),
            getVariantWithItemStats(Grade, "grade"),
            getVariantWithItemStats(Thickness, "thickness"),
            getVariantWithItemStats(Width, "width"),
        ]);

        res.status(200).json({
            success: true,
            message: "Fetched all variant details successfully",
            data: {
                cutters: {
                    total: cutters.length,
                    list: cutters,
                },
                grades: {
                    total: grades.length,
                    list: grades,
                },
                thicknesses: {
                    total: thicknesses.length,
                    list: thicknesses,
                },
                widths: {
                    total: widths.length,
                    list: widths,
                },
            },
        });
    } catch (err) {
        errorResponse(res, err);
    }
};

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
            data,
            message: "Successfully fetched the varients"
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

const getUpcomingItem = async (req, res) => {
    try {
        const items = await Item.find({ 'challan.challanNumber': null })
            .populate("grade width thickness shipTo challan")
            .sort({ createdAt: 1 })

        let listView = [];

        items.forEach((item) => {
            const formattedItems = {
                _id: item._id,
                wagonNumber: item.wagonNumber,
                challanNumber: item?.challan?.challanNumber,
                challanDate: item?.challan?.challanDate,
                type: item.type,
                grade: item.grade,
                width: item.width,
                originalQuantity: String(item.originalQuantity),
                currentQuantity: String(item.quantity),
                thickness: item.thickness,
                createdAt: item.createdAt,
                shipTo: item.shipTo,
                date: item.date
            };

            listView.push(formattedItems);
        });

        res.status(200).json({
            success: true,
            message: "Successfully fetched the upcoming item",
            items: listView
        })
    } catch (err) {
        errorResponse(res, err);
    }
}

// const xlsx = require('xlsx');
const xlsx = require('xlsx');
const uploadCSV = async (req, res) => {
    try {
        const { file } = req.files;
        if (!file) return errorResponse(res, "No file uploaded");

        // Read Excel file
        const workbook = xlsx.readFile(file.tempFilePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        // res.status(200).json({
        //     success: true,
        //     data
        // })
        // return;

        // Prepare all items
        const itemsToInsert = [];


        for (const row of data) {
            // Parse challan date
            const challanDate = row["CHALLAN-DATE"]
                ? new Date(row["CHALLAN-DATE"])
                : null;

            // Get variant refs by name (or create if not found)
            const gradeName = extractGradeFromDescription(row["MATERIAL-DESCRIPTION"]);
            const thicknessValue = extractThickness(row["MATERIAL-DESCRIPTION"]);
            const widthValue = extractWidth(row["MATERIAL-DESCRIPTION"]);

            let grade = await Grade.findOne({ name: gradeName });
            let thickness = await Thickness.findOne({ name: thicknessValue });
            let width = await Width.findOne({ name: widthValue });
            let shipTo = await Cutter.findOne({ name: row["SHIP-TO"] });
            if (!grade && gradeName) {
                grade = await Grade.create({
                    name: gradeName
                })
            }
            if (!thickness && thicknessValue) {
                thickness = await Thickness.create({
                    name: thicknessValue
                })
            }
            if (!width && widthValue) {
                width = await Width.create({
                    name: widthValue
                })
            }
            if (!shipTo && row["SHIP-TO"]) {
                shipTo = await Cutter.create({
                    name: row["SHIP-TO"]
                })
            }
            // if (!grade || !thickness || !width) {
            //     // console.warn(`Skipped row - variant not found:`, row);
            //     continue;
            // }

            // Parse transport detail
            const vehicleNumber = row["VEHICLE"]
                ? row["VEHICLE"]
                : null;
            const loader = row["LOADER"]
                ? row["LOADER"]
                : null;
            const transporterName = row["TRANSPORT"]
                ? row["TRANSPORT"]
                : null;

            itemsToInsert.push({
                type: detectMaterialType(row["MATERIAL-DESCRIPTION"]),
                grade: grade._id,
                thickness: thickness._id,
                width: width._id,
                wagonNumber: row["WAGON-NO."] || null,
                challan: {
                    challanDate,
                    challanNumber: row["CHALLAN-NO."],
                },
                originalQuantity: Number(row["QUANTITY"] || 0),
                quantity: Number(row["QUANTITY"] || 0),
                shipTo: shipTo ? shipTo._id : null,
                transport: {
                    vehicleNumber: row["VEHICLE"] || null,
                    loader: row["LOADER"] || null,
                    transporterName: row["TRANSPORT"] || null,
                },
            });
        }

        if (!itemsToInsert.length) {
            return errorResponse(res, "No valid items found in file");
        }
        console.log(itemsToInsert)
        await Item.insertMany(itemsToInsert);

        res.status(200).json({
            success: true,
            message: "Successfully added the items",
            length: itemsToInsert.length
        });

    } catch (err) {
        errorResponse(res, err);
    }
};

// 🔍 Helper to detect material type
function detectMaterialType(description = '') {
    const lower = description.toLowerCase();
    if (lower.includes('hot')) return 'Hot Rolled';
    if (lower.includes('cold')) return 'Cold Rolled';
    if (lower.includes('galvanized')) return 'Galvanized';
    if (lower.includes('color')) return 'Color Coated';
    if (lower.includes('stainless')) return 'Stainless Steel';
    if (lower.includes('aluminum')) return 'Aluminum';
    return 'Hot Rolled';
}

// 🧩 Extractors from "Material Description"
function extractGradeFromDescription(desc = '') {
    // Example: "1.5 X 900 X A1" → "A1"
    const parts = desc.split('X').map(p => p.trim());
    return parts[2] || '';
}

function extractThickness(desc = '') {
    const parts = desc.split('X').map(p => p.trim());
    return parts[0] || '';
}

function extractWidth(desc = '') {
    const parts = desc.split('X').map(p => p.trim());
    return parts[1] || '';
}

const downloadTemplate = async (req, res) => {
    try {
        // 🧾 Define headers (as the first row)
        const headers = [
            ["WAGON-NO.", "CHALLAN-DATE", "CHALLAN-NO.", "MATERIAL-DESCRIPTION", "QUANTITY", "SHIP-TO", "VEHICLE", "LOADER", "TRANSPORT"]];

        // 📄 Create worksheet from headers
        const worksheet = xlsx.utils.aoa_to_sheet(headers);

        // 📘 Create workbook and append worksheet
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

        // 📦 Write workbook to buffer
        const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        // 📥 Send response as downloadable file
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=template.xlsx"
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(buffer);
    } catch (error) {
        console.error("Error generating template:", error);
        res.status(500).json({ message: "Failed to download template" });
    }
};

const getExcelItem = async (req, res) => {
    try {
        const {
            search,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit = 50,
            filters = null
        } = req.body;

        console.log(filters)


        let query = {};

        query.wagonNumber = { $ne: null };

        // 🔍 Search
        if (search) {
            query.$or = [
                { type: { $regex: search, $options: "i" } },
                { wagonNumber: { $regex: search, $options: "i" } },
                { formType: { $regex: search, $options: "i" } },
            ];
        }

        // 🎯 Filters
        if (filters) {
            Object.keys(filters).forEach((key) => {
                const value = filters[key];
                if (!value) return;

                if (key === 'remaining') {
                    if (value === 'remaining') {
                        query.quantity = { $gt: 0 };
                    } else if (value === 'finished') {
                        query.quantity = 0;
                    }
                    return; // ✅ prevent overwriting below
                }

                const skipKeys = new Set(["remaining", "fromDate", "toDate"]);
                Object.keys(filters).forEach((key) => {
                    if (skipKeys.has(key)) return;
                    const value = filters[key];
                    if (!value) return;

                    // apply regex search only for pure string filters
                    if (["type", "formType"].includes(key)) {
                        query[key] = { $regex: value, $options: "i" };
                    }
                    else if (key === "wagonNumber") {
                        // in case wagonNumber is number-like (not string)
                        if (isNaN(value)) {
                            query[key] = { $regex: value, $options: "i" };
                        } else {
                            query[key] = Number(value);
                        }
                    }
                    else if (key === "shipTo") {
                        // shipTo is likely ObjectId
                        query[key] = value;
                    }
                    else if (key === "challanNumber") {
                        // nested string field
                        query["challan.challanNumber"] = { $regex: value, $options: "i" };
                    }
                    else {
                        // default exact match
                        query[key] = value;
                    }
                });
            });
            if (filters.fromDate && filters.toDate) {
                query["challan.challanDate"] = {
                    $gte: new Date(filters.fromDate),
                    $lte: new Date(filters.toDate),
                };
            }
        }


        const skip = (page - 1) * limit;

        // 📦 Fetch items
        // const items = await Item.find(query)
        //     .populate("grade width thickness shipTo challan transport")
        //     .sort({ createdAt: - 1 })

        const items = await Item.find(query)
            .populate("grade width thickness shipTo challan transport") // removed challan populate (it's embedded)
            .sort({ [sortBy]: order === "asc" ? 1 : -1 })

        const total = await Item.countDocuments(query);

        // 🧩 Group by wagonNumber

        const listView = [];

        items.forEach((item) => {
            const formattedItems = {
                _id: item._id,
                wagonNumber: item.wagonNumber || 'NA',
                challanNumber: item?.challan?.challanNumber,
                challanDate: item?.challan?.challanDate,
                type: item.type || 'NA',
                grade: item.grade?.name || 'NA',
                width: item.width?.name || 'NA',
                quantity: item.originalQuantity || 'NA',
                thickness: item.thickness?.name || 'NA',
                shipTo: item?.shipTo?.name || 'NA',
                createdAt: item.createdAt || 'NA',
                transporterName: item.transport?.transporterName || 'NA',
                loader: item.transport?.loader || 'NA',
                vehicleNumber: item.transport?.vehicleNumber || 'NA',
                remaining: item.quantity || 'NA',
            };

            listView.push(formattedItems);
        });

        const payload = listView.map((item) => ({
            WagonNumber: item.wagonNumber || "N/A",
            ChallanDate: item.challanDate,
            ChallanNumber: item?.challanNumber || "N/A",
            Type: item.type,
            Description: `${item.thickness || "N/A"} X ${item.width || "N/A"} ${item.grade || "N/A"}`,
            Weight: item.quantity,
            Cutters: item.shipTo || "N/A",
            vehicle: item.vehicleNumber,
            loader: item.loader,
            transport: item.transporterName,
            Remaining: item.remaining,
        }));

        const workbook = xlsx.utils.book_new();

        // Convert JSON data to worksheet
        const worksheet = xlsx.utils.json_to_sheet(payload);

        // Optional: Set column widths for better readability
        worksheet['!cols'] = [
            { wch: 12 }, // Date
            { wch: 14 }, // ChallanDate
            { wch: 16 }, // ChallanNumber
            { wch: 10 }, // Weight
            { wch: 10 }, // Remaining
            { wch: 30 }, // Description
            { wch: 12 }, // Cutters
            { wch: 14 }, // WagonNumber
        ];

        // Add worksheet to workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Stock Data');

        // Generate buffer
        const excelBuffer = xlsx.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx'
        });

        // Set headers for file download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=stock-data-${Date.now()}.xlsx`
        );
        res.setHeader('Content-Length', excelBuffer.length);

        // Send the buffer
        res.send(excelBuffer);

    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({
            message: 'Error generating Excel file',
            error: error.message
        });
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
    deleteVarient,
    getAllDetailVarient,
    getUpcomingItem,
    uploadCSV,
    downloadTemplate,
    getExcelItem,
}