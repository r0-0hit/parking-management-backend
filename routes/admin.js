const Manager = require('./models/Manager');
const ParkingSpot = require('./models/ParkingSpot');

// Get managers with their parking spots
const getManagers = async (req, res) => {
    try {
        // Fetch all managers
        const managers = await Manager.find().lean();

        // Attach parking spots for each manager by querying the ParkingSpot collection
        const data = await Promise.all(
            managers.map(async (manager) => {
                const parkingSpots = await ParkingSpot.find({ manager_id: manager._id }, 'name').lean(); // Fetch only 'name' field
                return {
                    ...manager,
                    parkingSpots, // Attach parking spots to the manager object
                };
            })
        );

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch managers', error });
    }
};

// Remove manager
const removeManager = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the manager has any associated parking spots
        const parkingSpots = await ParkingSpot.find({ manager_id: id });

        if (parkingSpots.length > 0) {
            return res.status(400).json({ message: 'Cannot remove a manager with assigned parking spots' });
        }

        // Remove the manager
        await Manager.findByIdAndDelete(id);

        res.status(200).json({ message: 'Manager removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove manager', error });
    }
};

module.exports = { getManagers, removeManager };
