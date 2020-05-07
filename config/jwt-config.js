module.exports = {
  secret: "mysupersecret",
  expiresIn: 600000, // expires in 10 minutes
  notBefore: 60000, // we can use the token only after 1 minute
  audience: "site-users",
};
