const mongoose = require('mongoose')

const ParkingSpotSchema = new mongoose.Schema({
	name: { type: String, required: true },
	location: { type: String, required: true },
	hourly_rate: { type: Number, required: true },
	manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	rating: { type: 'Number', default: 3.5 },
	num_ratings: { type: 'Number', default: 0 },
	latitude: { type: 'Number', required: true },
	longitude: { type: 'Number', required: true },
})

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema)
