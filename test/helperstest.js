const { assert } = require("chai");

const findUserByEmail = require("../helper.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("findUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = findUserByEmail(testUsers, "user@example.com");
    console.log(user);
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    });
    assert.strictEqual(user.id, expectedOutput);
  });

  it("Given an invalid email this should return false", function () {
    const actual = findUserByEmail(testUsers, "user@examplefff.com");
    const expectedOutput = false;

    assert.strictEqual(actual, expectedOutput);
  });
});
