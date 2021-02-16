const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

const generateRandomString = () => { // generating a unique shortURL of 6 digits
  let res = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    res += chars[Math.floor(Math.random() * 6)];
  }
  return res;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


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
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]; // Accessing the longURL
  let templateVars = {
    shortURL,
    longURL
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});