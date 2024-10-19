// AdminController.js
// This controller handles admin functionalities, such as managing user accounts and viewing app-wide data.

const sportsService = require('../services/AdminService');

// Create a new sport
exports.createSport = async (req, res) => {
    try {
        const { name, description, icon_url } = req.body;
        const newSport = await sportsService.createSport({ name, description, icon_url });
        return res.status(201).json(newSport);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get all sports
exports.getAllSports = async (req, res) => {
    try {
        const sports = await sportsService.getAllSports();
        return res.status(200).json(sports);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get a sport by ID
exports.getSportById = async (req, res) => {
    try {
        const sportId = req.params.sportId;
        const sport = await sportsService.getSportById(sportId);
        if (!sport) {
            return res.status(404).json({ message: 'Sport not found' });
        }
        return res.status(200).json(sport);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Update a sport by ID
exports.updateSport = async (req, res) => {
    try {
        const sportId = req.params.sportId;
        const updatedData = req.body;
        const updatedSport = await sportsService.updateSport(sportId, updatedData);
        if (!updatedSport) {
            return res.status(404).json({ message: 'Sport not found' });
        }
        return res.status(200).json(updatedSport);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Delete a sport by ID
exports.deleteSport = async (req, res) => {
    try {
        const sportId = req.params.sportId;
        const deletedSport = await sportsService.deleteSport(sportId);
        if (!deletedSport) {
            return res.status(404).json({ message: 'Sport not found' });
        }
        return res.status(200).json({ message: 'Sport deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
