const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['user_id'],
  })
);

app.set('view engine', 'ejs');

const {
  generateRandomString,
  avail,
  fetchUserData,
  checkShortURL,
  checkIfOwned,
  urlsForUser,
  userLoggedIn,
  addUser,
} = require('./helper_functions');

const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'ibrik96' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'ibrik96' },
};

const users = {
  ibrik96: {
    id: 'ibrik96',
    email: 'ibrahim@khalilov.com',
    password: 'ibrik96',
  },
  nijat11: {
    id: 'nijat11',
    email: 'nijat11@gmail.com',
    password: 'nijat11',
  },
};

app.get('/', (req, res) => {
  const user = userLoggedIn(req.session.userId, users);
  if (user) {
    res.redirect('/urls')
  } else {
    res.redirect('/login');
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  const user = userLoggedIn(req.session.userId, users);
  if (user) {
    res.redirect('/urls');
  } else {
    let templateVars = { userLoggedIn: user };
    res.render('urls_registration', templateVars);
  }
});

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  if (email === '') {
    res.status(400).send('Email is missing');
  } else if (password === '') {
    res.status(400).send('Password is missing');
  } else if (!avail(email, users)) {
    res.status(400).send('This email is not available');
  } else {
    const newUser = addUser(req.body, users);
    req.session.userId = newUser.id;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const user = userLoggedIn(req.session.userId, users);
  if (user) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      userLoggedIn: user
    };
    res.render('urls_login', templateVars);
  }
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const passwordUsed = req.body.password;
  const temp = fetchUserData(userEmail, users); 
  if (temp) {
    const [ id, password] = temp;
    console.log('passwordUsed: ' + passwordUsed);
    console.log('password: ' + password);
   // if (!bcrypt.compareSync(passwordUsed, password)) {
    if (passwordUsed !== password) {
      res.status(403).send('ERROR!!! Password incorrect');
    } else {
      req.session.userId = id;
      res.redirect('/urls');
    }
  } else {
    res.status(403).send('ERROR!!! No email found');
  }
});

app.get('/urls', (req, res) => {
  const user = userLoggedIn(req.session.userId, users);
  if (!user) {
    res.render('urls_errors');
  } else {
    const usersLinks = urlsForUser(user, urlDatabase);
    let templateVars = {
      urls: usersLinks,
      currentUser: userLoggedIn(req.session.userId, users)
    };
    res.render(`urls_index`, templateVars);
  }
});

app.post('/urls', (req, res) => {
  const user = userLoggedIn(req.session.userId, users)
  if (!user) {
    res.redirect('/login');
  } else {
    const shortURL = generateRandomString();
    const newURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: newURL, userID: user };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get('/urls/new', (req, res) => {
  const user = userLoggedIn(req.session.userId, users);
  if (!user) {
    res.redirect('/login');
  } else {
    let templateVars = { userLoggedIn: user }
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const user = userLoggedIn(req.session.userId, users);
  if (checkShortURL(shortURL, urlDatabase)) {
    if (user !== urlDatabase[shortURL].userID) {
      res.send('Wrong ID');
    } else {
      const longURL = urlDatabase[shortURL].longURL;
      let templateVars = { shortURL: shortURL, longURL: longURL, userLoggedIn: user };
      res.render('urls_show', templateVars);
    } 
  } else {
    res.send('URL Not Found');
  }
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (checkShortURL(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('404: Page Not Found ☹️');
  }
});

// Deleting a URL
app.post('/urls/:shortURL/delete', (req, res) => {
if (!checkIfOwned(userLoggedIn(req.session.userId, users), req.params.shortURL, urlDatabase)) {
  res.send('Wrong ID')
} else {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
}
});

// Takes to the edit page
app.post('/urls/:shortURL/edit', (req, res) => {
  if (
    !checkIfOwned(
      userLoggedIn(req.session.userId, users),
      req.params.shortURL,
      urlDatabase
    )
  ) {
    res.send('Wrong ID');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
