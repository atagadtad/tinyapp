const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

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
  let userID = req.cookies.user_id;
  let templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let temporaryString = generatedRandomString()
  urlDatabase[temporaryString] = req.body.longURL;
  res.redirect(`/urls/${temporaryString}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//cookie:
app.get("/urls/new", (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = {
    user: users[userID]
  }
  res.render("urls_new", templateVars);
})

// cookie:
app.get("/urls/:shortURL", (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userID]
  };
  res.render("urls_show", templateVars);
})

// cookie:
app.get("/register", (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = {
    user: users[userID]
  }
  console.log(req.body);
  res.render("urls_registration", templateVars)
})

// created cookie:
app.post("/register", (req, res) => {
  let randomID = generatedRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;

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
  res.cookie("user_id", randomID)
  users[randomID] = { id: randomID, email: userEmail, password: userPassword }
  // console.log(users)
  res.redirect("/urls")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
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
  let userID = req.cookies.user_id;
  let templateVars = {
    user: users[userID]
  }
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userID = idFinder(users, userEmail);
  if (!emailFinder(users, userEmail)) {
    res.statusCode = 403;
    res.end("ERROR: 403. EMAIL NOT FOUND!")
    return;
  } else
    res.cookie("user_id", users[userID]["id"])

  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  let userID = req.cookies.user_id;
  res.clearCookie('user_id', req.cookies[userID]);
  console.log(users)
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
      return true;
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

