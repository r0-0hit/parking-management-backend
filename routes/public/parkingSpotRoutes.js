const express = require('express');
const ParkingSpot = require('../../models/ParkingSpot');

const router = express.Router();

// Get All Parking Spots
router.get('/', async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find().populate('manager_id', 'name email');
        res.json(parkingSpots);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching parking spots', error: error.message });
    }
});

// Get Parking Spot Details by ID
router.get('/:spotId', async (req, res) => {
    try {
        const parkingSpot = await ParkingSpot.findById(req.params.spotId).populate('manager_id', 'name email');

        if (!parkingSpot) {
            return res.status(404).json({ message: 'Parking spot not found.' });
        }

        res.json(parkingSpot);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching parking spot.', error: error.message });
    }
});

module.exports = router;
