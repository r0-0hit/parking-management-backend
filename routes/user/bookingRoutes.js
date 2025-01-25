const express = require('express')
const { verifyToken, isManager } = require('../../middleware/authMiddleware')
const Booking = require('../../models/Booking')
const ParkingSpot = require('../../models/ParkingSpot')
const dayjs = require('dayjs')
const sendEmailNotification = require('../../util/sendEmail')
const Manager = require('../../models/Manager')

const router = express.Router()

// Create Booking (User Only)
router.post('/', verifyToken, async (req, res) => {
	const {
		parking_spot_id,
		booking_date,
		start_time,
		end_time,
		total_cost,
		total_hours,
		transactionId,
		userEmail,
	} = req.body

	const user_id = req.user.id

	try {
		const booking = new Booking({
			user_id,
			parking_spot_id,
			booking_date,
			start_time,
			end_time,
			total_cost,
			total_hours,
			transactionId,
		})
		await booking.save()

		sendEmailNotification(userEmail, 'userPending')

		const parking = await ParkingSpot.findById(parking_spot_id).populate('manager_id')

		sendEmailNotification(parking.manager_id.email, 'managerPending')

		res.status(201).json({ message: 'Booking created successfully', booking })
	} catch (error) {
		res.status(500).json({ message: 'Error creating booking', error: error.message })
	}
})

router.put('/updateStatus', verifyToken, isManager, async (req, res) => {
	const { id, status, email } = req.body

	try {
		await Booking.findByIdAndUpdate(id, {
			status,
		})

		const info = await Booking.findById(id).populate('parking_spot_id')

		sendEmailNotification(
			email,
			status === 'confirmed' ? 'userConfirmed' : 'userRejected',
			info
		)

		res.status(201).json({ message: 'Booking updated successfully' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Error updating booking', error: error.message })
	}
})

//rating
router.put('/', verifyToken, async (req, res) => {
	const { id, rating } = req.body

	if (!id || !rating) {
		return res.status(400).json({ message: 'Booking ID and rating are required.' })
	}

	try {
		// Find the booking and ensure it exists
		const booking = await Booking.findById(id).populate('parking_spot_id')
		if (!booking) {
			return res.status(404).json({ message: 'Booking not found.' })
		}

		// Check if the booking is already rated
		if (booking.is_rated) {
			return res.status(400).json({ message: 'Booking has already been rated.' })
		}

		// Update the booking with the rating and mark it as rated
		booking.is_rated = true
		booking.rating = rating
		await booking.save()

		// Update the parking spot's average rating and num_ratings
		const parkingSpot = booking.parking_spot_id
		if (!parkingSpot) {
			return res.status(404).json({ message: 'Parking spot not found for this booking.' })
		}

		// Calculate the new average rating
		const totalRatings = parkingSpot.rating * parkingSpot.num_ratings
		const newTotalRatings = totalRatings + rating
		const newNumRatings = parkingSpot.num_ratings + 1
		const newAverageRating = newTotalRatings / newNumRatings

		parkingSpot.rating = newAverageRating
		parkingSpot.num_ratings = newNumRatings
		await parkingSpot.save()

		res.status(200).json({ message: 'Rating updated successfully.' })
	} catch (error) {
		console.error('Error while rating:', error.message)
		res.status(500).json({ message: 'Error while rating', error: error.message })
	}
})

// Get All Bookings for a User
router.get('/my-bookings', verifyToken, async (req, res) => {
	try {
		const bookings = await Booking.find({ user_id: req.user.id }).populate('parking_spot_id')
		res.json(bookings)
	} catch (error) {
		res.status(500).json({ message: 'Error fetching bookings', error: error.message })
	}
})

router.delete('/delete', verifyToken, async (req, res) => {
	const { id } = req.body

	if (!id) return res.status(400).json({ message: 'Invalid Id' })

	try {
		await Booking.findByIdAndDelete(id)
		res.status(200).json({ message: 'Booking Deleted Successfully' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error while deleting booking', error: error.message })
	}
})

module.exports = router
