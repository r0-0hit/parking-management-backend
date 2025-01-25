const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { verifyToken } = require('../middleware/authMiddleware')

const router = express.Router()

// Register User
router.post('/register', async (req, res) => {
	const { name, email, password } = req.body

	try {
		const hashedPassword = bcrypt.hashSync(password, 10)
		const user = new User({ name, email, password: hashedPassword })

		await user.save()
		res.status(201).json({ message: 'User registered successfully' })
	} catch (error) {
		res.status(500).json({
			message: 'Error registering user',
			error: error.message,
		})
	}
})

router.delete('/delete', verifyToken, async (req, res) => {
	const { id } = req.body

	if (!id) {
		res.status(404).json({ message: 'Invalid ID' })
	}

	try {
		await User.findByIdAndDelete(id)
		res.status(200).json({ message: 'Account Deleted Successfully' })
	} catch (error) {
		console.error(error)
		res.status(400).json({ message: 'Error during Deleting' })
	}
})

// Get All Users
router.get('/', async (req, res) => {
	try {
		const users = await User.find()
		res.json(users)
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching users',
			error: error.message,
		})
	}
})

module.exports = router
