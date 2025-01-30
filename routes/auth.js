const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // console.log(email, password)

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

        // Check Admin
        const admin = await Admin.findOne({ email });
        // console.log(admin)
        if (admin && bcrypt.compareSync(password, admin.password)) {
            const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, role: 'admin', data: admin });
        }


        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Google Sign-In Route
router.post("/google", async (req, res) => {
    try {
        const { token } = req.body; // Token from frontend

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture, sub } = ticket.getPayload(); // sub is Google user ID

        // Check if user already exists in the database
        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new one
            user = new User({
                name,
                email,
                password: "", // No password needed for Google login
                googleId: sub, // Save Google ID
                profilePic: picture,
            });
            await user.save();
        }

        // Generate JWT token for user authentication
        const authToken = jwt.sign(
            { id: user._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token: authToken, role: "user", data: user });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: "Authentication failed" });
    }
});




module.exports = router;
