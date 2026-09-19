const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    userId:{ type: String, required: true },
    action:{ type: String, required: true },
    metadata:{ type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
})

schema.index({ userId: 1, timestamp: -1 })
schema.index({ action: 1, timestamp: -1 })
schema.index({ timestamp: -1 })

module.exports = mongoose.model("Activity", schema)