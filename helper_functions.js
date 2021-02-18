const generateRandomString = () => {
  // generating a unique shortURL of 6 digits
  let res = '';
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    res += chars[Math.floor(Math.random() * 6)];
  }
  return res;
};

// Checking if the username is registered
const notAvail = (val, db) => {
  for (user in db) {
    if (user[val]) {
      return true;
    }
  }
  return null;
};

const fetchUserData = (email, db) => {
  for (let key in db) {
    if (db[key].email === email) {
      return db[key];
    }
  }
};

const checkShortURL = (URL, db) => {
  return db[URL];
}

const checkIfOwned = (userID, urlID, db) => {
  return userID === db[urlID].userID;
}

const urlsForUser = (id, db) => {
  let currentUserId = id;
  let userURLs = {};
  for (let key in db) {
    if (db[key].userID == currentUserId) {
      userURLs[key] = db[key];
    }
  }
  return userURLs;
  }

  const userLoggedIn = (cookie, db) => {
    for (let id in db) {
      if (cookie === id) {
        return db[id].email;
      }
    }
  }

  module.exports = {
    generateRandomString,
    notAvail,
    fetchUserData,
    checkShortURL,
    checkIfOwned,
    urlsForUser,
    userLoggedIn
  }