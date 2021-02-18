const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

app.set('view engine', 'ejs');


const {
  generateRandomString,
  notAvail,
  fetchUserData,
  checkShortURL,
  checkIfOwned,
  urlsForUser,
  userLoggedIn
} = require('./helper_functions');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "ibrik96" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "ibrik96" }
};

const users = {
  "ibrik96" : {
    "id": "ibrik96",
    "email": "ibrahim@khalilov.com",
    "password": "ibrik96"
  },
  "nijat12": {
    "id": "nijat12",
    "email": "nijat12@gmail.com",
    "password": "nijat12"
  }
};

app.get('/', (req, res) => {
  // Homepage returns Hello
  res.send('Hello!');
});

app.get('/register', (req, res) => {
  let templateVars = {
    currentUser: userLoggedIn(req.session.user_id, users)
  };
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  const { password } = req.body;
  const hashedPwd = bcrypt.hashSync(password, 10);
  const email = req.body.email;
  if (email === '') {
    res.status(403).send('Email is missing');
  }
  else if(password === '') {
    res.status(403).send('Password is missing');
  }
  else if (notAvail(email, users)) {
    res.status(403).send('This email is not available');
  } else {
    req.body.password = hashedPwd;
  newUser = addUser(req.body, users);
  res.session('user_id', newUser.id);
  res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    currentUser: userLoggedIn(req.session.user_id, users)
  };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const passwordUsed = req.body.password;
  if (fetchUserData(userEmail, users)) {
    const password = fetchUserData(userEmail, users).password;
    const id = fetchUserData(userEmail, users).id;
    if (bcrypt.compareSync(passwordUsed, password)) {
      res.status(403).send('ERROR!!! Password incorrect');
    } else {
      req.session.user_id = id;
      res.redirect('/urls');
    }
  } else {
    res.status(403).send('ERROR!!! No email found');
  }
});

app.get('/urls', (req, res) => {
  const currentUser = userLoggedIn(req.session.user_id, users);
  if (!currentUser) {
    res.send('Sign In or Register')
  }
  const userLinks = urlsForUser(currentUser, urlDatabase);
  let templateVars = { urls: urlDatabase, currentUser: userLoggedIn(req.session.user_id, users) };
  res.render(`urls_index`, templateVars);
});

app.post('/urls', (req, res) => {
  if (req.session) {
 const shortURL = generateRandomString();
 const newURL = req.body.longURL;
 const user = userLoggedIn(req.session.user_id, users);
 urlDatabase[shortURL] = {longURL: newURL, userID: user};
 res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login');
  }
});


app.get('/urls/new', (req, res) => {
  const currentUser = userLoggedIn(req.session.user_id, users);
  if (!currentUser) {
    res.redirect('/login');
  } else {
  let templateVars = {
    currentUser: currentUser
  };
  res.render('urls_new', templateVars);
}
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUser = userLoggedIn(req.session.user_id, users);
  if (!urlDatabase[shortURL]) {
    res.send('Link does not exist');
  }
    else if (currentUser !== urlDatabase[shortURL].userID) {
    res.send('Wrong ID')
  }
  if (checkShortURL(shortURL, urlDatabase)) {
    let longURL = urlDatabase[req.params.shortURL].longURL; // Accessing the longURL
    let templateVars = { shortURL: shortURL, longURL: longURL, current_user: userLoggedIn(req.session.user_id, users)};
    res.render('urls_show', templateVars);
  } else {
    res.send('Does not exist')
  }
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (checkShortURL(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL)
  } else {
    res.status(404).send('404: Page Not Found ☹️')
  }
});

// Deleting a URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const currentUser = userLoggedIn(req.session.user_id, users);
  const shortURL = req.params.shortURL;
  if (currentUser !== urlDatabase[shortURL].userID) {
    res.send('This ID does not belong to you');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Takes to the edit page
app.post('/urls/:shortURL/edit', (req, res) => {
  if (!checkIfOwned(userLoggedIn(req.session.user_id, users), req.params.shortURL, urlDatabase)) {
    res.send('This ID does not belong to you');
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Adding a user
const addUser = (newUser) => {
  const newUserID = generateRandomString();
  newUser.id = newUserID;
  users[newUserID] = newUser;
  return newUser;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
