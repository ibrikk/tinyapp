const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

function generateRandomString() {
  let res = '';
  for (let i = 6; i > 0; i--) {
    res += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 6)];
  }
  return res;
}

 // console.log(generateRandomString());  - testing if the function works
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca', 
  '9sm5xK': 'http://www.google.com',
};

app.get('/', (req, res) => { // Homepage returns Hello
  res.send('Hello!')
});

app.post('/urls', (req, res) => {
  console.log(req.body); // Logging POST request body to the console
  res.send('Ok');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; // Accessing the longURL
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n'); // Passing html
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});