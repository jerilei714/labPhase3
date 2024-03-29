const { connectToDB } = require('./labDatabase.js');
const { ObjectId } = require('mongodb');


async function createSeat(seat) {
  const db = await connectToDB();
  const result = await db.collection('seat').insertOne(seat);
  return result.insertedId;
}

async function getSeat(seatId) {
  const db = await connectToDB();
  return db.collection('seat').findOne({ _id: seatId });
}

async function updateSeat(seatId, updatedSeat) {
  const db = await connectToDB();
  const result = await db.collection('seat').updateOne(
    { _id: seatId },
    { $set: updatedSeat }
  );
  return result.modifiedCount > 0;
}

async function deleteSeat(seatId) {
  const db = await connectToDB();
  const result = await db.collection('seat').deleteOne({ _id: seatId });
  return result.deletedCount > 0;
}

async function getAvailableSeatCount(labName, date) {
  const db = await connectToDB();
  const lab = await db.collection('laboratory').findOne({ lab_name: labName });
  if (!lab) {
      throw new Error('Laboratory not found');
  }
  const totalSeats = lab.total_seats;
  const reservedSeatsCount = await db.collection('reserved_seats').countDocuments({ 
      lab_id: labName, 
      reserve_date: date 
  });
  return totalSeats - reservedSeatsCount;
}



async function getSeatsByLabName(labName) {
    const db = await connectToDB();
    return db.collection('seat').find({ lab_name: labName }).toArray();
}

async function updateSeatStatus(labName, seatNumber, status) {
    const db = await connectToDB();
    const result = await db.collection('seat').updateOne(
        { lab_name: labName, seat_number: seatNumber },
        { $set: { seat_status: status } }
    );
    return result.modifiedCount > 0;
}

module.exports = { createSeat, getSeat, updateSeat, deleteSeat, getAvailableSeatCount, getSeatsByLabName, updateSeatStatus };

