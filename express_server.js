const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

// helper functions:
const { getUserByEmail,
  generatedRandomString,
  idFinder,
  urlsForUser } = require('./helpers');

app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'user_id',
  keys: ['id'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set('trust proxy', 1)

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
};

app.get("/", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  } else {
    res.redirect('/urls');
    return;
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//cookie:
app.get("/urls", (req, res) => {
  let userID = req.session.user_id;

  let templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  let temporaryString = generatedRandomString();
  urlDatabase[temporaryString] = { longURL: req.body.longURL, userID: userID };
  res.redirect(`/urls/${temporaryString}`);
});

app.get("/u/:shortURL", (req, res, next) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  req.session.views = (req.session.views || 0) + 1
  urlDatabase[req.params.shortURL]['views'] = req.session.views;
  console.log(urlDatabase);
  res.redirect(longURL);
});

//cookie:
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user: users[userID]
  };
  if (!userID) {
    res.statusCode = 401;
    res.redirect('/urls');
    return;
  }
  res.render("urls_new", templateVars);
});

// cookie:
app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (!userID || userID !== urlDatabase[shortURL]['userID']) {
    res.statusCode = 401;
    res.end("UNAUTHORIZED ACCESS.");
    return;
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: users[userID],
    views: urlDatabase[shortURL]['views'] + ' views',
  };
  res.render("urls_show", templateVars);
});

// cookie:
app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user: users[userID]
  };

  res.render("urls_registration", templateVars);
});

// created cookie:
app.post("/register", (req, res) => {
  const randomID = generatedRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (userEmail === '' || userPassword === '') {
    res.statusCode = 400;
    res.end("ERROR 400, PLEASE INPUT VALID EMAIL AND/OR PASSWORD");
    return;
  }
  if (getUserByEmail(userEmail, users)) {
    res.statusCode = 400;
    res.end("EMAIL ALREADY FOUND IN DATABASE!");
    return;
  }
  req.session.user_id = randomID;
  users[randomID] = { id: randomID, email: userEmail, password: hashedPassword };
  res.redirect("/urls");
});

app.delete("/urls/:shortURL/delete", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.statusCode = 401;
    res.end("UNAUTHORIZED ACCESS. PLEASE LOGIN");
    return;
  } else {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.put("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL]['longURL'] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// cookie:
app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user: users[userID]
  };
  res.render("urls_login", templateVars);
});

// set cookie for userID with ID from users object if they've already registered
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userID = idFinder(users, userEmail);
  let userPWD = req.body.password;

  if (!getUserByEmail(userEmail, users)) {
    res.statusCode = 403;
    res.end("ERROR: 403. EMAIL NOT FOUND!");
    return;

  } else if (getUserByEmail(userEmail, users))
    if (!bcrypt.compareSync(userPWD, users[userID].password)) {
      res.statusCode = 403;
      res.end("ERROR: 403. WRONG PASSWORD!");
      return;
    } else {
      req.session.user_id = getUserByEmail(userEmail, users);
    }

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('user_id.sig');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});