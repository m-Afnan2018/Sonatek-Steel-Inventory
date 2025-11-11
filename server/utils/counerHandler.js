const Counter = require("../models/counterModel");

async function getNextIndex(key) {
    const counter = await Counter.findByIdAndUpdate(
        { _id: key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}

module.exports = getNextIndex;