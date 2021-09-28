const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
   "hjd3hdj": "http://www.yahoo.ca"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase  };
  res.render("urls_index", templateVars);
});

// parse anything after /urls/
// load urls_show view
// pass object templateVars to urls_view
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longUrl = urlDatabase[shortURL]
  const templateVars = { shortURL: shortURL, longURL: longUrl };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL
  console.log(urlDatabase)
  console.log(req.body);  // Log the POST request body to the console
  res.redirect("/urls/");         // Respond with 'Ok' (we will replace this)
});


//express will parse 'monkey' in the address bar

app.get("/u/:jesson", (req, res) => {

  const shortURL = req.params.jesson
  longURL = urlDatabase[shortURL]
  res.redirect(longURL)
});



function generateRandomString() {
return Math.random().toString(36).slice(2, 8)

};




// 3 ways that the server and browser give data to each other
// 1- req.params: server reads browser url request
//2- req.body how you get form data back to server
// 3- templateVars its how the server gives browser info