const bcrypt = require("bcryptjs");

async function hash({ password }) {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}

async function compare({ password, hashPassword }) {
  const comparePassword = bcrypt.compare(password, hashPassword);
  return comparePassword;
}

module.exports = {
  hash,
  compare,
};
