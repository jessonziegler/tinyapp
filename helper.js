function findUserByEmail(usersDatabase, email) {
  for (let userId in usersDatabase) {
    if (usersDatabase[userId].email === email) {
      console.log("I found user", usersDatabase[userId]);
      //console.log(usersDatabase[userId]);
      return usersDatabase[userId];
    }
  }
  return false;
}

module.exports = findUserByEmail;
// if adding more then one helper function here
// put curly braces around all exports (finduserbyemail)
