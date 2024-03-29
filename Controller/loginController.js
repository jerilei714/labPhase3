const express = require('express');
const { getUser, addRememberMeToken, removeExpiredRememberMeTokens } = require('../Model/labUsers');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', async (req, res) => {
    const exclusions = ['/css/', '/script/', '/image/'];
    if (exclusions.some(path => req.url.startsWith(path))) {
        return next();
    }
    console.log("Login attempt!")
    try {
        const { username, password, rememberMe } = req.body;
        const user = await getUser(username);
        if (user && user.password === password) {
            const token = jwt.sign({ username: user.username, userId: user.id }, "fd619fbed37454c3c75b121d7e07e4e310f77f5b502b9dcb6a9f749952cab382", { expiresIn: '30m' });
            if (rememberMe) {
                const rememberToken = jwt.sign({ username: user.username, userId: user.id }, "fd619fbed37454c3c75b121d7e07e4e310f77f5b502b9dcb6a9f749952cab382", { expiresIn: '1h' }); 
                await addRememberMeToken(username, rememberToken);
                await removeExpiredRememberMeTokens(username);
                res.cookie('rememberMe', rememberToken, { httpOnly: true, maxAge: 1814400000 });
            }
            res.status(200).json({ username: user.username, accountType: user.accountType, token: token });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
