const express = require('express');
const { createUser, doesUserExist } = require('../Model/labUsers');
const { createUserStudent } = require('../Model/labStudents');
const { createUserStaff } = require('../Model/labStaffs');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { username, name, password, email, course, accountType, profilePic, description } = req.body;
        const userExists = await doesUserExist(username);
        if (userExists) {
            return res.status(409).send('Username already exists.');
        }
        if (username == "Anonymous"){
            return res.status(410).send('Username Invalid.');
        }
        let defaultProfilePic = 'image/Default_pfp.jpg';
        let defaultDescription = 'Comp Sci Baddie Account';
        if (accountType === 'Student') {
            defaultDescription = 'Student Account';
        } else if (accountType === 'Lab Facilitator') {
            defaultDescription = 'Lab Facilitator Account';
        }
        const user = {
            username,
            name,
            password,
            email,
            course,
            accountType,
            profilePic: profilePic || defaultProfilePic,
            description: description || defaultDescription
        };

        const userId = await createUser(user);

        if (accountType === 'Student') {
            await createUserStudent(userId, username, course, description);
        } else if (accountType === 'Lab Facilitator') {
            await createUserStaff(userId, username);
        }
        res.status(201).send('Registration successful!');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
