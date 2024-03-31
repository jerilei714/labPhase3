const express = require('express');
const bcrypt = require('bcrypt');
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
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (isPasswordValid) {
                const tokenJWT = "fd619fbed37454c3c75b121d7e07e4e310f77f5b502b9dcb6a9f749952cab382"
                const token = jwt.sign({ username: user.username, userId: user.id }, tokenJWT, { expiresIn: '30m' });
                
                if (rememberMe) {
                    const rememberToken = jwt.sign({ username: user.username, userId: user.id }, tokenJWT, { expiresIn: '1h' }); 
                    await addRememberMeToken(username, rememberToken);
                    await removeExpiredRememberMeTokens(username);
                    res.cookie('rememberMe', rememberToken, { httpOnly: true, maxAge: 1814400000 });
                } else {
                    const sessionToken = jwt.sign({ username: user.username, userId: user.id }, tokenJWT);
                    req.sessionToken = sessionToken; 
                    res.cookie('sessionToken', sessionToken, { httpOnly: true, maxAge: 1800 * 1000, secure: true, withCredentials: true });
                }
                res.status(200).json({ username: user.username, accountType: user.accountType, token: token });
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
