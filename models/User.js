const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	password: { type: String }, // 👈 Make password optional for Google users
	googleId: { type: String, unique: true, sparse: true }, // 👈 Store Google ID if signing in via Google
	bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
})

module.exports = mongoose.model('User', UserSchema)
