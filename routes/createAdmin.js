const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware')

// Route to create a new admin
router.post('/', isAdmin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the admin
        const admin = new Admin({
            email,
            password: hashedPassword,
        });

        await admin.save();

        res.status(201).json({ message: 'Admin created successfully', admin: { email: admin.email } });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin', error });
    }
});

module.exports = router;
