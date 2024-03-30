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

    const token = req.cookies.rememberMe;
    if (!token || token.trim() === '') {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await getUserByToken(token);
        if (!user) {
            res.cookie('rememberMe', '', { httpOnly: true, expires: new Date(0) });
            return next();
        }
        if (user.rememberMe) {
            const newToken = jwt.sign({ username: user.username, userId: user.id }, JWT_SECRET, { expiresIn: '3w' });
            await removeRememberMeToken(user.username, token);
            await removeExpiredRememberMeTokens(user.username);
            await addRememberMeToken(user.username, newToken);
            res.cookie('rememberMe', newToken, { httpOnly: true, maxAge: 1814400000, secure: true, withCredentials: true });
        } else {
            const sessionToken = jwt.sign({ username: user.username, userId: user.id }, JWT_SECRET);
            req.sessionToken = sessionToken; 
            res.cookie('sessionToken', sessionToken, { httpOnly: true });
        }
        req.user = { username: user.username, accountType: user.accountType, userId: user.id };
        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);
        res.cookie('rememberMe', '', { httpOnly: true, expires: new Date(0) });
        return next();
    }
};

module.exports = {
    router,
    cookieAuth
};