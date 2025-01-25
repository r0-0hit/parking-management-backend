const express = require('express')
const bcrypt = require('bcryptjs')
const Manager = require('../models/Manager')
const { verifyToken } = require('../middleware/authMiddleware')

const router = express.Router()

// Register Manager
router.post('/register', async (req, res) => {
	const { name, email, password } = req.body

	try {
		const hashedPassword = bcrypt.hashSync(password, 10)
		const manager = new Manager({ name, email, password: hashedPassword })

		await manager.save()
		res.status(201).json({ message: 'Manager registered successfully' })
	} catch (error) {
		res.status(500).json({ message: 'Error registering manager', error: error.message })
	}
})

router.delete('/delete', verifyToken, async (req, res) => {
	const { id } = req.body

	if (!id) {
		res.status(404).json({ message: 'Invalid ID' })
	}

	try {
		await Manager.findByIdAndDelete(id)
		res.status(200).json({ message: 'Account Deleted Successfully' })
	} catch (error) {
		console.error(error)
		res.status(400).json({ message: 'Error during Deleting' })
	}
})

// Get All Managers
router.get('/', async (req, res) => {
	try {
		const mangers = await Manager.find()
		res.json(mangers)
	} catch (error) {
		res.status(500).json({ message: 'Error fetching managers', error: error.message })
	}
})

module.exports = router
