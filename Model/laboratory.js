const { connectToDB } = require('./labDatabase.js');
const { ObjectId } = require('mongodb');

async function createLab(lab) {
  const db = await connectToDB();
  const result = await db.collection('laboratory').insertOne(lab);
  return result.insertedId;
}

async function getLab(labId) {
  const db = await connectToDB();
  return db.collection('laboratory').findOne({ _id: new ObjectId(labId) });
}

async function getLabNamesAndIds() {
  const db = await connectToDB();
  const labs = await db.collection('laboratory').find({}, { projection: { lab_name: 1, _id: 1 } }).toArray();
  return labs.map(lab => ({ lab_name: lab.lab_name, lab_id: lab._id.toString() }));
}

async function updateLab(labId, updatedLab) {
  const db = await connectToDB();
  const result = await db.collection('laboratory').updateOne(
    { _id: new ObjectId(labId) },
    { $set: updatedLab }
  );
  return result.modifiedCount > 0;
}

async function getLabByName(labName) {
  const db = await connectToDB();
  return db.collection('laboratory').findOne({ lab_name: labName });
}

async function getMostReservedLabs() {
  const db = await connectToDB();
  const labs = await db.collection('reserved_seats').aggregate([
    { $group: { _id: "$lab_id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 } 
  ]).toArray();
  const mostReservedLabs = await Promise.all(labs.map(async (lab) => {
    const labDetails = await db.collection('laboratory').findOne({ lab_name: lab._id });
    return {
      lab_name: labDetails.lab_name,
      location: labDetails.location, 
      reservations: lab.count
    };
  }));
  return mostReservedLabs;
}


async function deleteLab(labId) {
  const db = await connectToDB();
  const result = await db.collection('laboratory').deleteOne({ _id: new ObjectId(labId) });
  return result.deletedCount > 0;
}

module.exports = { createLab, getLab, updateLab, deleteLab, getLabNamesAndIds, getLabByName, getMostReservedLabs };
