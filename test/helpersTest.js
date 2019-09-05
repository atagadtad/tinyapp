const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput, 'should equal userRandomID');
  });

  it('should return non-existent email as undefined', function () {
    const user = getUserByEmail("aaron@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput, 'should equal undefined');
  })
});

