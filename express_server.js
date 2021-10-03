const express = require("express");
const app = express();
const PORT = 8080;
const findUserByEmail = require("./helper");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
let cookieSession = require("cookie-session");
const salt = bcrypt.genSaltSync(10);
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["Beatles!123", "Rollingstones123!"],
  })
);
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt),
  },
};

function filterUrlsDatabaseByUser(urlDatabase, userID) {
  let outputObject = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      outputObject[key] = urlDatabase[key];
    }
  }
  return outputObject;
}

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[req.session.user_id],
  };
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  console.log("url database", urlDatabase);
  let outputObject = filterUrlsDatabaseByUser(urlDatabase, req.session.user_id);
  const templateVars = { urls: outputObject, currentUser: user };
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = { currentUser: users[req.session.user_id] };

  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { currentUser: users[req.session.user_id] };

  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(403).send("URL Does Not Exist");
  }
  const longUrl = urlDatabase[shortURL].longURL;
  if (!user) {
    return res.redirect("/login");
  }
  let canEdit = true;
  if (user.id !== urlDatabase[shortURL].userID) {
    res.status(403);
    canEdit = false;
  }

  const templateVars = {
    canEdit,
    shortURL: shortURL,
    longURL: longUrl,
    currentUser: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();

  if (!users[req.session.user_id]) {
    return res.status(403).send("You Are Not Logged In");
  } else {
    urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    console.log(urlDatabase);
    console.log(req.body);
    res.redirect("/urls/");
  }
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  if (urlDatabase[req.params.shortUrl].userID !== req.session.user_id) {
    return res.status(403).send("Unauthorized");
  }
  delete urlDatabase[req.params.shortUrl];
  res.redirect("/urls");
});
app.post("/urls/:shortUrl", (req, res) => {
  if (urlDatabase[req.params.shortUrl].userID !== req.session.user_id) {
    return res.status(403).send("Unauthorized");
  }
  const longURL = req.body.longUrl;
  const shortURL = req.params.shortUrl;
  urlDatabase[shortURL] = {
    longURL: req.body.longUrl,
    userID: req.session.user_id,
  };
  res.redirect("/urls");

  console.log(req.body);
  console.log(req.params);
});
app.post("/login", (req, res) => {
  const user = findUserByEmail(users, req.body.email);
  if (!user) {
    return res.status(403).send("Email Can't Be Found");
  }
  // if user is found but password wrong send 403
  const passwordFromForm = req.body.password;
  // were checking that password from request matches password from database for that user
  if (bcrypt.compareSync(passwordFromForm, user.password)) {
    req.session.user_id = user.id;

    res.redirect("/urls");
  } else {
    res.status(403).send("Wrong Password");
  }
});
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let randomString = generateRandomString();
  let password = req.body.password;
  let email = req.body.email;
  if (!email || !password) {
    return res.status(400).send("Email And Password Needed");
  }
  const user = findUserByEmail(users, email);
  if (user) {
    return res.status(400).send("User Already Exists, Enter Different Email");
  }
  const hashedPassword = bcrypt.hashSync(password, salt);
  users[randomString] = {
    id: randomString,
    password: hashedPassword,
    email,
  };
  console.log(users);
  req.session.user_id = randomString;

  res.redirect("/urls");
});

app.get("/u/:shortUrl", (req, res) => {
  const shortURL = req.params.shortUrl;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("Short Url Does Not Exist In Database");
  }
  longURL = urlDatabase[shortURL].longURL;

  if (
    longURL.substring(0, 4) !== "http" &&
    longURL.substring(0, 5) !== "https"
  ) {
    longURL = "http://" + longURL;
  }

  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// 3 ways that the server and browser give data to each other
// 1- req.params: server reads browser url request
//2- req.body how you get form data back to server
// 3- templateVars its how the server gives browser info
