const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	parking_spot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
	booking_date: { type: Date, required: true },
	start_time: { type: String, required: true },
	end_time: { type: String, required: true },
	total_hours: { type: Number, required: true },
	total_cost: { type: Number, required: true },
	rating: { type: Number },
	is_rated: { type: Boolean, default: false },
	status: {
		type: String,
		enum: ['pending', 'confirmed', 'rejected'],
		default: 'pending', // Default is 'pending' when booking is created
	},
	transactionId: {
		type: String,
		required: true, // Transaction ID will be added when payment is confirmed
	},
})

module.exports = mongoose.model('Booking', BookingSchema)
