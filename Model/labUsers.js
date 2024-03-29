const { connectToDB } = require('./labDatabase.js');

async function createUser(user) {
  const db = await connectToDB();
  const result = await db.collection('users').insertOne(user);
  return result.insertedId;
}

async function getUser(username) {
  const db = await connectToDB();
  const result = await db.collection('users').findOne({ username: username });
  return result;
}

async function addRememberMeToken(username, token) {
  const db = await connectToDB();
  const expiryDate = new Date(Date.now() + 1814400000); 
  const result = await db.collection('users').updateOne(
      { username: username },
      { $push: { rememberTokens: { token: token, expires: expiryDate } } }
  );
  return result.modifiedCount > 0;
}

async function removeRememberMeToken(username, token) {
  const db = await connectToDB();
  const result = await db.collection('users').updateOne(
    { username: username },
    { $pull: { rememberTokens: { token: token } } }
  );

  return result.modifiedCount > 0;
}
async function removeExpiredRememberMeTokens(username) {
  const db = await connectToDB();
  const currentDate = new Date();
  const result = await db.collection('users').updateOne(
    { username: username },
    { $pull: { rememberTokens: { expires: { $lt: currentDate } } } } 
  );
  return result.modifiedCount > 0;
}


async function getUserByToken(token) {
  const db = await connectToDB();
  return db.collection('users').findOne({ "rememberTokens.token": token });
}


async function updateUser(username, updatedUser) {
  const db = await connectToDB();
  const result = await db.collection('users').updateOne(
    { username: username },
    { $set: updatedUser }
  );
  return result.modifiedCount > 0;
}

async function doesUserExist(username) {
  const db = await connectToDB();
  const user = await db.collection('users').findOne({ username: username });
  return !!user; 
}

async function deleteUser(username) {
  const db = await connectToDB();
  const deleteUserResult = await db.collection('users').deleteOne({ username:username });
  const userDeletionSuccess = deleteUserResult.deletedCount > 0;
  if (!userDeletionSuccess) {
    return false;
  }
  await db.collection('student').deleteMany({ username:username });
  await db.collection('staff').deleteMany({ username:username });
  const reservations = await db.collection('reserved_seats').find({ username:username }).toArray();
  reservations.forEach(async (reservation) => {
    await db.collection('reservations').deleteMany({ _id: reservation.reservation_id });
  });
  await db.collection('reserved_seats').deleteMany({ username:username });
  return true;
}


async function getUsersByAccountType(accountType) {
  const db = await connectToDB();
  const Students = db.collection('users').find({ accountType: accountType }).toArray();
  return Students;
}

function comparePasswords(oldPassword, userPassword) {
  return oldPassword === userPassword;
}

module.exports = { doesUserExist, removeRememberMeToken, createUser, getUser, updateUser, deleteUser, getUsersByAccountType, addRememberMeToken, removeExpiredRememberMeTokens, getUserByToken, comparePasswords };
