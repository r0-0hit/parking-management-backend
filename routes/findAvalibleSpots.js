const express = require('express')
const dayjs = require('dayjs')
const ParkingSpot = require('../models/ParkingSpot')
const Booking = require('../models/Booking')
const { verifyToken } = require('../middleware/authMiddleware')
const getDistance = require('../util/getDistance')

const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const { location, start, end, date, lat, lng } = req.query

		// Validate input parameters
		if (!location || !start || !end || !date) {
			return res.status(400).json({ message: 'Missing required parameters' })
		}

		// Parse and format the date/time
		const parsedDate = dayjs(date).startOf('day').toDate()
		const startTime = dayjs(`${date} ${start}`).toDate()
		const endTime = dayjs(`${date} ${end}`).toDate()

		if (startTime >= endTime) {
			return res.status(400).json({ message: 'Start time must be before end time' })
		}

		// Find all conflicting bookings
		const conflictingBookings = await Booking.find({
			booking_date: parsedDate, // Match the exact booking date
			$or: [
				{
					start_time: { $lt: endTime },
					end_time: { $gt: startTime },
				},
				{
					start_time: { $gte: startTime, $lt: endTime },
				},
			],
			status: { $in: ['confirmed', 'pending'] }, // Only consider relevant booking statuses
		}).select('parking_spot_id')

		// Extract IDs of booked parking spots
		const bookedSpotIds = conflictingBookings.map(booking => booking.parking_spot_id.toString())

		let availableSpots

		if (location === 'Your Current Location') {
			console.log(lat, lng)

			if (!lat || !lng) {
				return res.status(400).json({
					message: 'Latitude and longitude are required for "Near Me" search',
				})
			}

			// Fetch all parking spots
			const allSpots = await ParkingSpot.find({
				_id: { $nin: bookedSpotIds }, // Exclude booked spots
			})

			// Filter spots within a 5 km radius
			const radiusInKm = 5
			availableSpots = allSpots.filter(spot => {
				const distance = getDistance(lat, lng, spot.latitude, spot.longitude)
				return distance <= radiusInKm
			})
		} else {
			// Query available parking spots based on the location
			availableSpots = await ParkingSpot.find({
				location: { $regex: location, $options: 'i' },
				_id: { $nin: bookedSpotIds },
			})
		}

		// Return available parking spots
		res.json(availableSpots)
	} catch (err) {
		console.error('Error finding available spots:', err)
		res.status(500).json({ message: 'Internal server error' })
	}
})

// router.get('/near-me', verifyToken, async (req, res) => {
// 	const {lat, lng} = req.query

// 	try {
// 		const response = await axios.get('http://localhost:5000/api/available-spots', {
// 				params: { location, date, start, end },
// 			})
// 	} catch (error) {

// 	}
// })

module.exports = router

// const express = require('express')
// const dayjs = require('dayjs')
// const ParkingSpot = require('../models/ParkingSpot')
// const Booking = require('../models/Booking')
// const router = express.Router()
// const { verifyToken } = require('../middleware/authMiddleware')

// // Route to check availability based on user input
// router.get('/', verifyToken, async (req, res) => {
// 	try {
// 		// Extract user input from query params
// 		const { location, parsedDate, start, end } = req.query

// 		// Parse the date using Day.js (assume date is in Day.js format)
// 		// const parsedDate = dayjs(date) // Convert to a Date object
// 		// const start = dayjs(parsedDate)
// 		// 	.hour(dayjs(startTime).hour())
// 		// 	.minute(dayjs(startTime).minute())
// 		// 	.toDate()
// 		// const end = dayjs(parsedDate)
// 		// 	.hour(dayjs(endTime).hour())
// 		// 	.minute(dayjs(endTime).minute())
// 		// 	.toDate()

// 		// Query to find parking spots at the specified location
// 		const availableSpots = await ParkingSpot.find({ location })

// 		// Find all bookings that conflict with the requested time range
// 		const conflictingBookings = await Booking.find({
// 			booking_date: { $eq: dayjs(parsedDate).toDate() }, // Match the exact booking date
// 			$or: [
// 				{
// 					start_time: { $lt: end },
// 					end_time: { $gt: start },
// 				},
// 				{
// 					start_time: { $gte: start },
// 					start_time: { $lt: end },
// 				},
// 			],
// 		})

// 		// Get a list of parking spots that are already booked
// 		const bookedSpotIds = conflictingBookings
// 			.filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
// 			.map(booking => booking.parking_spot_id.toString())

// 		// Filter available parking spots by excluding those with conflicting bookings
// 		const finalAvailableSpots = availableSpots.filter(
// 			spot => !bookedSpotIds.includes(spot._id.toString())
// 		)

// 		// Return the available parking spots
// 		res.json(finalAvailableSpots)
// 	} catch (err) {
// 		console.error(err)
// 		res.status(500).json({ message: 'Server error' })
// 	}
// })

// module.exports = router
