const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const cookie = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookie());
app.set('view engine', 'ejs');

const generateRandomString = () => { // generating a unique shortURL of 6 digits
  let res = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    res += chars[Math.floor(Math.random() * 6)];
  }
  return res;
}


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca', 
  '9sm5xK': 'http://www.google.com',
};

app.get('/', (req, res) => { // Homepage returns Hello
  res.send('Hello!')
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
    longURL: newURL
  };
  res.redirect(`urls/${shortURL}`);
});

app.get('/urls', (req, res) => {
  let templateVars = { 
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { 
    username: req.cookies['username']
}
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]; // Accessing the longURL
  let templateVars = {
    shortURL,
    longURL,
    username: req.cookies['username']
};
  res.render('urls_show', templateVars);
});
// Deleting a URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Redirecting to short URL
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
// Login endpoint
app.post('/login', (req, res) => {
  if(req.body.username) {
    const username = req.body.username;
    res.cookie('username', username);
  }
  res.redirect('./urls');
}); 
// Logout endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});