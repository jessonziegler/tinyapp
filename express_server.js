const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

  const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


function findUserByEmail(usersDatabase, email){
 for (let userId in usersDatabase){
   if (usersDatabase[userId].email === email) {
    console.log("I found user",usersDatabase[userId])
    return usersDatabase[userId]
   }
 }
return false;
};
// above function does the following:
// loops through all ids in database
//checks if email exists and returns if it does

function filterUrlsDatabaseByUser(urlDatabase, userID ) {
  let outputObject = {}
  for (let key in urlDatabase) {
if (urlDatabase[key].userID === userID) {
  outputObject[key] = urlDatabase[key]
}

}
return outputObject;
}



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
  const templateVars = { urls: urlDatabase, currentUser: users[req.cookies["user_id"]] }
if (!users[req.cookies["user_id"]]) {
  res.redirect("/login");
} else {
  res.render("urls_new", templateVars);

}

});

app.get("/urls", (req, res) => {
  console.log('Cookies: ', req.cookies)
const user = users[req.cookies["user_id"]];
console.log("url database", urlDatabase)
let outputObject = filterUrlsDatabaseByUser(urlDatabase, req.cookies["user_id"])
  const templateVars = { urls: outputObject, currentUser: user };
  res.render("urls_index", templateVars);

});
app.get("/register", (req, res) => {
  const templateVars = { currentUser: users[req.cookies["user_id"]]};

  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { currentUser: users[req.cookies["user_id"]]};

  res.render("urls_login", templateVars);
});




// parse anything after /urls/
// load urls_show view
// pass object templateVars to urls_view
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longUrl = urlDatabase[shortURL].longURL
  const templateVars = { shortURL: shortURL, longURL: longUrl, currentUser: users[req.cookies["user_id"]]}
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString()

  if (!users[req.cookies["user_id"]]) {
  return res.status(403).send("You Are Not Logged In")

  } else {
    urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.cookies["user_id"]  }
    console.log(urlDatabase)
    console.log(req.body);
  res.redirect("/urls/");
  }
});



app.post("/urls/:shortUrl/delete", (req, res) => {
  delete urlDatabase[req.params.shortUrl];
  res.redirect("/urls");
});
app.post("/urls/:shortUrl/", (req, res) => {
const longURL = req.body.longUrl
const shortURL = req.params.shortUrl
urlDatabase[shortURL]  = {longURL: req.body.longUrl, userID: req.cookies["user_id"]  }
res.redirect("/urls");

console.log(req.body)
console.log(req.params)
});
app.post("/login",(req, res) => {
const user = findUserByEmail(users, req.body.email)
if (!user) {
  return res.status(403).send("Email Can't Be Found")
}
// if user is found but password wrong send 403
const passwordFromForm = req.body.password
// were checking that password from request matches password from database fo that user
if (passwordFromForm === user.password ) {
  res.cookie("user_id", user.id)
  res.redirect("/urls")
} else {
res.status(403).send("Wrong Password")
}




});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let randomString = generateRandomString()
  let password = req.body.password;
  let email = req.body.email
  if (!email || !password){
    return res.status(400).send("Email And Password Needed")
  }
  const user = findUserByEmail(users, email)
  if (user) {
return res.status(400).send("User Already Exists, Enter Different Email")
  }

users[randomString] = {
    id: randomString,
    password,
    email
  }
  console.log(users)
  res.cookie("user_id", randomString)
  res.redirect("/urls");
});




app.get("/u/:jesson", (req, res) => {

  const shortURL = req.params.jesson
  if (!(urlDatabase[shortURL])) {
  res.status(400).send("Short Url Does Not Exist In Database")

  }
  longURL = urlDatabase[shortURL].longURL
  if  (!(longURL.substring(0, 7) === 'http://')) {
  console.log("inside statement", longURL )
  longURL = "http://" + longURL
  }

  res.redirect(longURL)
});



function generateRandomString() {
return Math.random().toString(36).slice(2, 8)

};




// 3 ways that the server and browser give data to each other
// 1- req.params: server reads browser url request
//2- req.body how you get form data back to server
// 3- templateVars its how the server gives browser info