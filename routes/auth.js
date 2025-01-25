const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Manager = require('../models/Manager');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, role: 'user', data: user });
        }

        let manager = await Manager.findOne({ email });
        if (manager && bcrypt.compareSync(password, manager.password)) {
            const token = jwt.sign({ id: manager._id, role: 'manager' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, role: 'manager', data: manager });
        }

        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
