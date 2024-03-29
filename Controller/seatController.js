const express = require('express');
const { createSeat, getSeat, updateSeat, deleteSeat, getAvailableSeatCount, getSeatsByLabName } = require('../Model/labSeats');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { lab_id, lab_name, seat_number, seat_status } = req.body;
        const seat = {
            lab_id,
            lab_name,
            seat_number,
            seat_status
        };
        const seatId = await createSeat(seat);
        res.status(201).json({ seatId });
    } catch (error) {
        console.error('Error creating seat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:seatId', async (req, res) => {
    try {
        const { seatId } = req.params;
        const seat = await getSeat(seatId);
        if (seat) {
            res.json(seat);
        } else {
            res.status(404).json({ error: 'Seat not found' });
        }
    } catch (error) {
        console.error('Error getting seat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:seatId', async (req, res) => {
    try {
        const { seatId } = req.params;
        const updatedSeatData = req.body;
        const success = await updateSeat(seatId, updatedSeatData);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Seat not found' });
        }
    } catch (error) {
        console.error('Error updating seat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:seatId', async (req, res) => {
    try {
        const { seatId } = req.params;
        const success = await deleteSeat(seatId);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Seat not found' });
        }
    } catch (error) {
        console.error('Error deleting seat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/available/:labName', async (req, res) => {
    try {
        const { labName } = req.params;
        const { date } = req.query; 
        const availableSeatCount = await getAvailableSeatCount(labName, date);
        res.json(availableSeatCount);
    } catch (error) {
        console.error('Error fetching available seat count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/seats/:labName', async (req, res) => {
    try {
        const { labName } = req.params;
        const seats = await getSeatsByLabName(labName);
        res.json(seats);
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
