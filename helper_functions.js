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
  for (let key in db) {
    if (db[key].email === email) {
      return [ db[key], db[key].password ]
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
  for (let key in db) {
    if (db[key].userID == currentUserId) {
      userURLs[key] = db[key];
    }
  }
  return userURLs;
};
// checks the current user
const userLoggedIn = (cookieUser, db) => {
 
  for (let key in db) {

    if (cookieUser.id === db[key].id && cookieUser.password === db[key].password) {
      return db[key];
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
