const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

// const password = "purple-monkey-dinosaur";
// const hashedPassword = bcrypt.hashSync(password, 10);
// console.log(hashedPassword);
// app.use(cookieParser());

app.use(cookieSession({
  name: 'user_id',
  keys: ['id'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


const users = {
  "aJ48lW": {
    id: "userRandomID",
    email: "user@example.com",
    password: "asdf"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// when asked for /urls.json in the browser, server responeds with the
// .json of the urlDatabase object
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
    urls: urlsForUser(userID),
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  let userID = req.session.user_id;
  let temporaryString = generatedRandomString()
  urlDatabase[temporaryString] = { longURL: req.body.longURL, userID: userID };
  res.redirect(`/urls/${temporaryString}`)
  console.log(urlDatabase)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

//cookie:
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user: users[userID]
  }
  res.render("urls_new", templateVars);
})

// cookie:
app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  console.log(req.params)
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: users[userID]
  };
  res.render("urls_show", templateVars);
})

// cookie:
app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user: users[userID]
  }
  console.log(req.body);
  res.render("urls_registration", templateVars)
})

// created cookie:
app.post("/register", (req, res) => {
  const randomID = generatedRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (userEmail === '' || userPassword === '') {
    res.statusCode = 400;
    res.end("ERROR 400, PLEASE INPUT VALID EMAIL AND/OR PASSWORD")
    return;
  }
  if (emailFinder(users, userEmail)) {
    res.statusCode = 400;
    res.end("EMAIL ALREADY FOUND IN DATABASE!")
    return;
  }
  req.session.user_id = randomID;
  users[randomID] = { id: randomID, email: userEmail, password: hashedPassword }
  // console.log(users)
  res.redirect("/urls")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.statusCode = 401;
    res.end("UNAUTHORIZED ACCESS. PLEASE LOGIN")
    return;
  } else {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = req.body.longURL
  console.log(shortURL)
  console.log(longURL)
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
})

// cookie:
app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user: users[userID]
  }
  res.render("urls_login", templateVars);
})

// set cookie for userID
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userID = idFinder(users, userEmail);
  let userPWD = req.body.password;

  if (!emailFinder(users, userEmail)) {
    res.statusCode = 403;
    res.end("ERROR: 403. EMAIL NOT FOUND!")
    return;
  } else if (emailFinder(users, userEmail))
    if (!bcrypt.compareSync(userPWD, users[userID].password)) {
      res.statusCode = 403;
      res.end("ERROR: 403. WRONG PASSWORD!")
      return;
    } else {
      res.session.users[userID]["id"];
    }
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  // let userID = req.session.user_id;
  req.session.user_id = null;
  // console.log(users)
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

function randomLetter(c) {
  if (c < 256) {
    return Math.abs(c).toString(16);
  }
  return 0;
}

function generatedRandomString() {
  let sixString = '';
  for (i = 0; sixString.length < 6; i++) {
    sixString += randomLetter(Math.round(Math.random() * 256));
  }
  return sixString;
};

// true if it finds matching email, false if it doesn't
function emailFinder(userObject, email) {
  let objFilter = Object.values(userObject);
  for (user of objFilter) {
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

function idFinder(userObject, email) {
  let objFilter = Object.values(Object.values(userObject))
  for (element of objFilter) {
    if (element.email === email) {
      return element.id;
    }
  }
};

function urlsForUser(id) {
  let urlObj = {};
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL]['userID'] === id) {
      urlObj[shortURL] = urlDatabase[shortURL]['longURL'];
    }
  }
  return urlObj;
};

// console.log(urlsForUser("aJ48lW"))
