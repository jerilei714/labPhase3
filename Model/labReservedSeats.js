const { connectToDB } = require('./labDatabase');
const { ObjectId } = require('mongodb');

async function createReservedSeat(seat) {
  const db = await connectToDB();
  const result = await db.collection('reserved_seats').insertOne(seat);
  return result.insertedId;
}

async function checkSeatAvailability(lab_id, seat_number, reserve_date) {
  const db = await connectToDB();
  const existingReservation = await db.collection('reserved_seats').findOne({
      lab_id: lab_id,
      seat_number: String(seat_number),
      reserve_date: reserve_date
  });
  return !existingReservation; 
}

async function getReservedSeat(seatId) {
  const db = await connectToDB();
  return db.collection('reserved_seats').findOne({ _id: seatId });
}

async function updateReservedSeat(seatId, updatedSeat) {
  const db = await connectToDB();
  const result = await db.collection('reserved_seats').updateOne(
    { _id: seatId },
    { $set: updatedSeat }
  );
  return result.modifiedCount > 0;
}

async function deleteReservedSeat(seatId) {
  const db = await connectToDB();
  const result = await db.collection('reserved_seats').deleteOne({ _id: seatId });
  return result.deletedCount > 0;
}

async function getReservedSeatsByLab(labId, date, startTime, endTime) {
  const db = await connectToDB();
  let query = {
    lab_id: labId,
    reserve_date: date
  };
  const potentialOverlaps = await db.collection('reserved_seats').find(query).toArray();
  const timeToMinutes = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const filteredOverlaps = potentialOverlaps.filter(({ reserve_time }) => {
    const [reserveStart, reserveEnd] = reserve_time.split(' - ').map(timeToMinutes);
    return (reserveStart < endMinutes && reserveEnd > startMinutes);
  });
  return filteredOverlaps;
}

async function updateReservedSeatByReservationId(reservationId, updatedSeat) {
  const db = await connectToDB();
  const result = await db.collection('reserved_seats').updateOne(
    { "reservation_id": new ObjectId(reservationId) },
    { $set: updatedSeat }
  );
  return result.modifiedCount > 0;
}

module.exports = { checkSeatAvailability, createReservedSeat, getReservedSeat, updateReservedSeat, deleteReservedSeat, getReservedSeatsByLab, updateReservedSeatByReservationId };


