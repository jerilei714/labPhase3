const { connectToDB } = require('./labDatabase.js');

async function createUserStaff(user_id, username) {
    const db = await connectToDB();
    const result = await db.collection('staff').insertOne({
        user_id,
        username
    });
    return result.insertedId;
}

async function getStaff(staffId) {
    const db = await connectToDB();
    return db.collection('staff').findOne({ _id: staffId });
}

async function updateStaff(staffId, updatedStaff) {
    const db = await connectToDB();
    const result = await db.collection('staff').updateOne(
        { _id: staffId },
        { $set: updatedStaff }
    );
    return result.modifiedCount > 0;
}

async function deleteStaff(staffId) {
    const db = await connectToDB();
    const result = await db.collection('staff').deleteOne({ _id: staffId });
    return result.deletedCount > 0;
}

module.exports = { createUserStaff, getStaff, updateStaff, deleteStaff };
