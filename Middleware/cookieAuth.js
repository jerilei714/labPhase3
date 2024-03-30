const jwt = require('jsonwebtoken');
const {getUserByToken,addRememberMeToken,removeExpiredRememberMeTokens, removeRememberMeToken} = require('../Model/labUsers');
const express = require('express');
const JWT_SECRET = "fd619fbed37454c3c75b121d7e07e4e310f77f5b502b9dcb6a9f749952cab382"; 
const router = express.Router();

const cookieAuth = async (req, res, next) => {
    const exclusions = ['/css/', '/script/', '/image/'];
    if (exclusions.some(path => req.url.startsWith(path))) {
        return next();
    }

    try {
        const rememberMeToken = req.cookies.rememberMe;
        const sessionToken = req.cookies.sessionToken;

        if (rememberMeToken && rememberMeToken.trim() !== '') {
            const decoded = jwt.verify(rememberMeToken, JWT_SECRET);
            const user = await getUserByToken(rememberMeToken);
            if (!user) {
                res.cookie('rememberMe', '', { httpOnly: true, expires: new Date(0) });
                return next();
            }
            const newToken = jwt.sign({ username: user.username, userId: user.id }, JWT_SECRET, { expiresIn: '3w' });
            await removeRememberMeToken(user.username, rememberMeToken);
            await removeExpiredRememberMeTokens(user.username);
            await addRememberMeToken(user.username, newToken);
            res.cookie('rememberMe', newToken, { httpOnly: true, maxAge: 1814400000, secure: true, withCredentials: true });
            req.user = { username: user.username, accountType: user.accountType, userId: user.id };
        } else if (sessionToken && sessionToken.trim() !== '') {
            const decoded = jwt.verify(sessionToken, JWT_SECRET);
            const user = await getUserByToken(sessionToken);
            if (!user) {
                res.cookie('sessionToken', '', { httpOnly: true, expires: new Date(0) });
                return next();
            }
            req.user = { username: user.username, accountType: user.accountType, userId: user.id };
        }

        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);
        res.cookie('rememberMe', '', { httpOnly: true, expires: new Date(0) });
        res.cookie('sessionToken', '', { httpOnly: true, expires: new Date(0) });
        next();
    }
};

module.exports = {
    router,
    cookieAuth
};



module.exports = {
    router,
    cookieAuth
};