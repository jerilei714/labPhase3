const express = require('express');
const path = require('path'); 
const router = express.Router();
const authenticated = require('../Middleware/authenticated');
const { getLabNamesAndIds, getMostReservedLabs} = require('../Model/laboratory');

router.get('/api/user-info', authenticated, (req, res) => {
    if (req.user) {
      res.json({
        authorized: true,
        username: req.user.username,
        accountType: req.user.accountType,
      });
    } else {
        res.json({
            authorized: false,
          });
    }
  });

  router.get('/most-reserved-labs', async (req, res) => {
    try {
        const labs = await getMostReservedLabs();
        res.json(labs);
    } catch (error) {
        console.error('Error fetching most reserved labs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


  router.get('/logout', function(req, res) {
    res.cookie('rememberMe', '', { expires: new Date(0), path: '/', httpOnly: true, secure: true });
    res.status(200).send('Logged out');
    console.log("Logged Out!")
  });
  



router.get('/', (req, res) => {
    res.render('index');
});

router.get('/viewSlots', (req, res) => {
    res.render('viewSlots');
});

router.get('/viewProfile', (req, res) => {
    res.render('viewProfile');
});

router.get('/resForStudent', (req, res) => {
    res.render('resForStudent');
});

router.get('/reserveSlots', (req, res) => {
    res.render('reserveSlots');
});

router.get('/reserveForStudent', (req, res) => {
    res.render('reserveForStudent');
});

router.get('/deleteReservations', (req, res) => {
    res.render('deleteReservations');
});

router.get('/reservations', (req, res) => {
    res.render('reservations');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/profile', (req, res) => {
    res.render('profile');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/editStudentReservations', (req, res) => {
    res.render('editStudentReservations');
});

router.get('/editReservationsContent', (req, res) => {
    res.render('editReservationsContent');
});

router.get('/editReservations', (req, res) => {
    res.render('editReservations');
});

module.exports = router;
