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
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
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
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
})

// cookie:
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.cookies["username"]);
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
