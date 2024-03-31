const express = require('express');
const bcrypt = require('bcrypt');
const { getUser, getUsersByAccountType, updateUser, deleteUser, comparePasswords  } = require('../Model/labUsers');
const { getReservedSeatsByLab } = require('../Model/labReservedSeats');
const { getReservation } = require('../Model/labReserves');
const { updateStudent } = require('../Model/labStudents'); 
const { updateStaff } = require('../Model/labStaffs');
const router = express.Router();

router.get('/students', async (req, res) => {
  try {
    const { accountType } = { accountType: 'Student' };
    const students = await getUsersByAccountType(accountType);
    res.json({ students });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:username/reservations', async (req, res) => {
  try {
      const { username } = req.params;
      const labId = req.query.labId;
      const reservedSeats = await getReservedSeatsByLab(labId);
      const reservationIds = reservedSeats.map(seat => seat.reservation_id);
      const reservations = await Promise.all(reservationIds.map(id => getReservation(id)));
      res.json(reservations);
  } catch (error) {
      console.error('Error fetching user reservations:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await getUser(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const success = await deleteUser(user.username);
    if (success) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/:username/editPfp', async (req, res) => {
  try {
    const { username } = req.params;
    const updatedUserData = req.body;
    const success = await updateUser(username, updatedUserData);
    if (success) {
      if(updatedUserData.accountType === 'Student') {
          const studentUpdateSuccess = await updateStudent(username, updatedUserData);
      } else if(updatedUserData.accountType === 'Staff') {
          const staffUpdateSuccess = await updateStaff(username, updatedUserData);
      }
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:username', async (req, res) => {
  try {
      const { username } = req.params;
      const { oldPassword, ...updatedUserData } = req.body;
      const user = await getUser(username);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ error: 'Old password is incorrect' });
      }
      if (updatedUserData.password && updatedUserData.password.trim()) {
        const hashedNewPassword = await bcrypt.hash(updatedUserData.password, 10); 
        updatedUserData.password = hashedNewPassword;
    } else {
        delete updatedUserData.password;
    }
      const success = await updateUser(username, updatedUserData);
      if (success) {
          if(updatedUserData.accountType === 'Student') {
              await updateStudent(username, updatedUserData);
          } else if(updatedUserData.accountType === 'Staff') {
              await updateStaff(username, updatedUserData);
          }
          res.status(200).json({ message: 'User updated successfully' });
      } else {
          res.status(404).json({ error: 'Failed to update user' });
      }
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;