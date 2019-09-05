
function emailFinder(userObject, email) {
  let objFilter = Object.values(userObject);
  for (user of objFilter) {
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

module.exports = { emailFinder }