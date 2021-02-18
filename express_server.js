const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const cookie = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookie());
app.set('view engine', 'ejs');

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

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

const userLoggedIn = (cookie) => {
  for (let id in users) {
    if (cookie === id) {
      return users[id].email;
    }
  }
};

app.get('/', (req, res) => {
  // Homepage returns Hello
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n'); // Passing html
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.post('/urls', (req, res) => {
  console.log(req.body); // Logging POST request body to the console
  const shortURL = generateRandomString();
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: newURL,
  };
  res.redirect(`urls/${shortURL}`);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    currentUser: userLoggedIn(req.cookies.user_id),
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const currentUser = userLoggedIn(req.cookies.user_id, users);
  if (!currentUser) {
    res.redirect('/login');
  }
  let templateVars = {
    currentUser: currentUser
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL]; // Accessing the longURL
  let templateVars = {
    shortURL,
    longURL,
    user_id: req.cookies['user_id'],
  };
  res.render('urls_show', templateVars);
});
// Deleting a URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Redirecting to longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
// Takes to the edit page
app.post('/urls/:shortURL/edit', (req, res) => {
  const key = req.params.shortURL;
  urlDatabase[key] = req.body.longURL;
  res.redirect('/urls');
});
// Login endpoint refactored
app.post('/login', (req, res) => {
    const userEmail = req.body.email;
    const passwordUsed = req.body.password;
    if (fetchUserData(userEmail, users)) {
      const password = fetchUserData(userEmail, users).password;
      const id = fetchUserData(userEmail, users).id;
      if (password !== passwordUsed) {
        res.status(403).send('ERROR!!! Password incorrect');
      } else {
        res.cookie('user_id', id);
        res.redirect('./urls');
      }
    } else {
      res.status(403).send('ERROR!!! No email found');
    }
  
});
// Logout endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = {
    currentUser: req.cookies.user_id,
  };
  res.render('urls_registration', templateVars);
});
// Adding a user
const addUser = (newUser) => {
  const newUserID = generateRandomString();
  newUser.id = newUserID;
  users[newUserID] = newUser;
  return newUser;
};



app.post('/register', (req, res) => {
  const { password } = req.body;
  const email = req.body.email;
  if (email === '') {
    res.status(403).send('Email is missing');
  }
  if (password === '') {
    res.status(403).send('Password is missing');
  }
  if (notAvail(email, users)) {
    res.status(403).send('This email is not available');
  }
  newUser = addUser(req.body, users);
  res.cookie('user_id', newUser.id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  let templateVars = {
    currentUser: userLoggedIn(req.cookies.user_id, users),
  };
  res.render('urls_login', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
