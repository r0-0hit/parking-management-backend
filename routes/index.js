const express = require('express');
const userBookingRoutes = require('./user/bookingRoutes');
const managerParkingSpotRoutes = require('./manager/parkingSpotRoutes');
const managerBookingRoutes = require('./manager/bookingRoutes');
const publicParkingSpotRoutes = require('./public/parkingSpotRoutes');

const router = express.Router();

// User Routes
router.use('/user/bookings', userBookingRoutes);

// Manager Routes
router.use('/manager/parking-spots', managerParkingSpotRoutes);
router.use('/manager/bookings', managerBookingRoutes);

// Public Routes
router.use('/public/parking-spots', publicParkingSpotRoutes);

module.exports = router;
