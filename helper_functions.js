const bcrypt = require('bcrypt');

// generating a unique shortURL of 6 digits
const generateRandomString = () => {
  let res = '';
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    res += chars[Math.floor(Math.random() * 6)];
  }
  return res;
};

// Checking if the username is registered
const avail = (val, db) => {
  for (let user in db) {
    if (db[user].email === val) {
      return false;
    }
  }
  return true;
};

const fetchUserData = (email, db) => {
  for (let user in db) {
    if (db[user].email === email) {
      return [ db[user], db[user].password ]
    }
  }
  return undefined;
};
// Checks if a shortURL exists
const checkShortURL = (URL, db) => {
  return db[URL];
};

const checkIfOwned = (userID, urlID, db) => {
  return userID === db[urlID].userID;
};

const urlsForUser = (id, db) => {
  let currentUserId = id;
  let userURLs = {};
  for (let user in db) {
    if (db[user].userID == currentUserId) {
      userURLs[user] = db[user];
    }
  }
  return userURLs;
};
// checks the current user
const userLoggedIn = (cookieUser, db) => {
 
  console.log('helper userLoggedIn cookieUser')
  console.log(cookieUser)
  console.log('helper userLoggedIn db')
  console.log(db)

  for (let user in db) {
    if (db[cookieUser].email === db[user].email && db[cookieUser].password === db[user].password) {
      return db[user].id;
    }
  }
  return undefined;
};

// Adding a user
const addUser = (newUser, db) => {
  const newUserID = generateRandomString();
  newUser.id = newUserID;
  newUser.password = bcrypt.hashSync(newUser.password, 10);
  db[newUserID] = newUser;
  return newUser;
};

module.exports = {
  generateRandomString,
  avail,
  fetchUserData,
  checkShortURL,
  checkIfOwned,
  urlsForUser,
  userLoggedIn,
  addUser,
};
