
function getUserByEmail(email, userObject) {
  let objFilter = Object.values(userObject);
  for (user of objFilter) {
    if (user.email === email) {
      return user.id;
    } else if (user.email !== email) {
      return undefined;
    }
  }
  return false;
};

module.exports = { getUserByEmail }
