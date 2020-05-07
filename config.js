require("dotenv").config();
const convict = require("convict");

const config = convict({
  env: {
    doc: "the application environment.",
    format: ["prod", "dev", "test"],
    default: "dev",
    arg: "env",
    env: "NODE_ENV",
  },
  app: {
    host: {
      doc: "The IP address to bind.",
      format: "*",
      default: "127.0.0.1",
      env: "IP_ADDRESS",
    },
    port: {
      doc: "The port to bind.",
      format: "port",
      default: 8080,
      env: "PORT",
      arg: "port",
    },
  },
  db: {
    host: {
      doc: "Database hostname/IP address",
      format: "*",
      default: "localhost",
    },
    name: {
      doc: "Database name",
      format: String,
      default: "users",
    },
    port: {
      doc: "Database port.",
      format: "port",
      default: 8082,
      env: "DB_PORT",
      arg: "dbPort",
    },
    user: {
      doc: "This is the username that will connect to the db.",
      format: String,
      default: "root",
    },
    password: {
      doc: "user's password",
      format: String,
      default: "rootpassword",
    },
    dialect: {
      doc: "Needed for Sequelize to understand db language.",
      format: ["mysql", "mariadb", "sqlite", "postgres", "mssql"],
      default: "mysql",
    },
    logging: {
      doc: "Activate Sequelize logs in the console.",
      format: Boolean,
      default: true,
    },
  },
  jwt: {
    secret: {
      default: "something",
      format: String,
      sensitive: true,
    },
    expiresIn: {
      format: String,
      default: "1m",
    },
    notBefore: {
      format: String,
      default: "10s",
    },
    audience: {
      format: String,
      default: "site-users",
    },
    issuer: {
      format: String,
      default: "thomas",
    },
    algorithm: {
      format: ["HS256", "HS384", "HS512"],
      default: "HS256",
    },
  },
});

const env = config.get("env");
config.loadFile(`./config/${env}.json`);
config.validate({ allowed: "strict" }); // throws error if config does not conform to schema

module.exports = config;
