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
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'ibrik96' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'ibrik96' },
};

const users = {
  ibrik96: {
    id: 'ibrik96',
    email: 'ibrahim@khalilov.com',
  },
  nijat11: {
    id: 'nijat11',
    email: 'nijat11@gmail.com',
    
  },
};

users.ibrik96.password = bcrypt.hashSync('ibrik96', 10);
users.nijat11.password = bcrypt.hashSync('nijat11', 10);


// Redirects the user depending on whether they are signed In
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

// Register endpoint
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

// Login endpoint
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const passwordUsed = req.body.password;
  const temp = fetchUserData(userEmail, users); 
  if (temp) {
    const [ user, password] = temp;
    if (!bcrypt.compareSync(passwordUsed, password)) {
      res.status(403).send('ERROR!!! Password incorrect');
    } else {
      req.session.userId = user.id;
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
    const userLinks = urlsForUser(user.id, urlDatabase);
    let templateVars = {
      urls: userLinks,
      currentUser: user
    };
    res.render('urls_index', templateVars);
  }
});

// If use is logged in, provides the functionality to create a short url
app.post('/urls', (req, res) => {
  const user = userLoggedIn(req.session.userId, users)
  if (!user) {
    res.redirect('/login');
  } else {
    const shortURL = generateRandomString();
    const newURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: newURL, userID: user.id };
   
    
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

// Displays shortURLs for the user
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const user = userLoggedIn(req.session.userId, users);
  if (checkShortURL(shortURL, urlDatabase)) {
   
    if (user.id !== urlDatabase[shortURL].userID) {
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
console.log('urlDatabase');
console.log(urlDatabase);
// gets the data to edit/delete shortURLs
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
  const user = userLoggedIn(req.session.userId, users);
  const check = checkIfOwned(user.id, req.params.shortURL, urlDatabase)
 
if (!check) {
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
      req.session.userId,
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
