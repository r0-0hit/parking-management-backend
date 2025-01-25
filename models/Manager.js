const mongoose = require('mongoose')

const ManagerSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	slots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot' }],
})

module.exports = mongoose.model('Manager', ManagerSchema)
