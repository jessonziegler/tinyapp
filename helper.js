// Function below will check if user exists
function findUserByEmail(usersDatabase, email) {
  for (let userId in usersDatabase) {
    if (usersDatabase[userId].email === email) {
      console.log("I found user", usersDatabase[userId]);
      return usersDatabase[userId];
    }
  }
  return false;
}

module.exports = findUserByEmail;
