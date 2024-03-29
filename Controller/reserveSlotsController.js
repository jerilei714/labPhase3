const express = require('express');
const router = express.Router();
const { getUser } = require('../Model/labUsers');
const { getLab } = require('../Model/laboratory');
const { createReservation } = require('../Model/labReserves');

router.get('/', async (req, res) => {
    try {
        const authorizedUsername = req.session.authorizedUsername;
        const user = await getUser(authorizedUsername);
        const labs = await getLabs();

        res.render('reserveSlots', { user, labs });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/reserve', async (req, res) => {
    try {
        const { lab_id, lab_name, seat_id, seat_number, user_id, username, reserve_date, reserve_time } = req.body;

        const reservation = {
            lab_id,
            lab_name,
            user_id,
            username,
            reserve_date,
            reserve_time
        };
        const reservationId = await createReservation(reservation);

        res.status(201).json({ reservationId });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
