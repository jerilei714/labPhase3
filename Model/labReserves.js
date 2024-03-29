const { use } = require('../Controller/labController.js');
const { connectToDB } = require('./labDatabase.js');
const { ObjectId } = require('mongodb');

async function createReservation(reservation) {
  const db = await connectToDB();
  const result = await db.collection('reservations').insertOne({
    ...reservation,
    tnd_requested: new Date().toISOString()
  });
  return result.insertedId;
}

async function getReservation(reservationId) {
  const db = await connectToDB();
  return db.collection('reservations').findOne({ _id: new ObjectId(reservationId) });
}

async function updateReservation(reservationId, updatedDetails) {
  const db = await connectToDB();
  const result = await db.collection('reservations').updateOne(
      { _id: new ObjectId(reservationId) },
      { $set: updatedDetails }
  );
  return result.modifiedCount > 0;
}

async function deleteReservation(reservationId) {
  try {
    const db = await connectToDB();
    const reservation = await db.collection('reservations').findOne({ _id: new ObjectId(reservationId) });
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    await db.collection('reservations').deleteOne({ _id: new ObjectId(reservationId) });
    await db.collection('reserved_seats').deleteOne({ reservation_id: new ObjectId(reservationId) });
    await db.collection('seat').updateOne(
      { lab_name: reservation.lab_name, seat_number: reservation.seat_number },
      { $set: { seat_status: 'Available' } }
    );

    return true;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return false;
  }
}

async function getReservedSeatsByUsername(username) {
  const db = await connectToDB();
  const userReservations = await db.collection('reserved_seats').find({ username: username }).toArray();
  return userReservations;
}

async function getReservationsByUsername(username, labId = null, reserveDate = null) {
  const db = await connectToDB();
  let query = { username: username };
  if (labId) {
      query.lab_id = labId;
  } if (reserveDate) {
      query.reserve_date = reserveDate;
  }
  return await db.collection('reserved_seats').find(query).toArray()
}

module.exports = { getReservationsByUsername, createReservation, getReservation, updateReservation, deleteReservation , getReservedSeatsByUsername, getReservationsByUsername };
