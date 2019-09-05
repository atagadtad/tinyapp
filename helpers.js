
function getUserByEmail(email, userObject) {
  let objFilter = Object.values(userObject);
  for (user of objFilter) {
    if (user.email === email) {
      return user.id;
    }
  }
  return undefined;
};

function randomLetter(c) {
  if (c < 256) {
    return Math.abs(c).toString(16);
  }
  return 0;
}

function generatedRandomString() {
  let sixString = '';
  for (let i = 0; sixString.length < 6; i++) {
    sixString += randomLetter(Math.round(Math.random() * 256));
  }
  return sixString;
}

function idFinder(userObject, email) {
  let objFilter = Object.values(Object.values(userObject));
  for (let element of objFilter) {
    if (element.email === email) {
      return element.id;
    }
  }
}

function urlsForUser(id, urlObject) {
  let urlObj = {};
  for (let shortURL in urlObject) {
    if (urlObject[shortURL]['userID'] === id) {
      urlObj[shortURL] = urlObject[shortURL]['longURL'];
    }
  }
  return urlObj;
}

module.exports = { getUserByEmail, generatedRandomString, idFinder, urlsForUser }


