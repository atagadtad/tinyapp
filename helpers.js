
function getUserByEmail(email, userObject) {
  let objFilter = Object.values(userObject);
  for (user of objFilter) {
    if (user.email === email) {
      return user.id;
    }
  }
  return false;
};

module.exports = { getUserByEmail }
