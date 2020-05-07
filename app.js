const express = require("express");
const Sequelize = require("sequelize");
const bodyParser = require("body-parser");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const PORT = 8088;

const app = express();

app.use(bodyParser.json());

// *  CONFIG

const dbConf = require("./config/db-config");
const jwtConf = require("./config/jwt-config");

// ******************************
// **            DB            **
// ******************************

const sequelize = new Sequelize(dbConf.db, dbConf.user, dbConf.pwd, {
  host: dbConf.host,
  port: dbConf.port,
  dialect: dbConf.dialect,
});

sequelize
  .authenticate()
  .then((data) => {
    console.log(`Successfully connected to database: '${dbConf.db}'`);
  })
  .catch((error) => {
    console.log(`Could not connect to database: '${dbConf.db}'`, error);
  });

// ******************************
// **          Models          **
// ******************************

const User = sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    //   fullName: {
    //     type: Sequelize.STRING(50),
    //     allowNull: false,
    //   },
    email: {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
    },
    status: {
      type: Sequelize.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
    password: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    modelName: "User",
  }
);

User.sync();

// Login a User
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({
    where: {
      email,
    },
  })
    .then((user) => {
      if (user) {
        // User in the database
        if (bcrypt.compareSync(password, user.password)) {
          const token = JWT.sign(
            {
              email: user.email,
              id: user.id,
            },
            jwtConf.secret,
            {
              expiresIn: jwtConf.expiresIn,
              notBefore: jwtConf.notBefore,
              audience: jwtConf.audience,
            }
          );

          res.status(200).json({
            status: 1,
            message: "You have successfully logged in.",
            token,
          });
        } else {
          res.status(401).json({
            status: 0,
            message: "Password is not correct.",
          });
        }
      } else {
        res.status(400).json({
          status: 0,
          message: "User does not exist with this email address.",
        });
      }
    })
    .catch((error) =>
      res.status().json({
        status: 0,
        message: "Could not look for the given email in the db.",
      })
    );
});

// Register a User
app.post("/user", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const status = req.body.status;
  const password = bcrypt.hashSync(req.body.password, 10); // hash value

  User.findOne({
    where: {
      email,
    },
  })
    .then((user) => {
      if (user) {
        res.status(300).json({
          status: 0,
          message: `User already exists with the email: ${email}`,
        });
      } else {
        User.create({
          firstName,
          lastName,
          email,
          status,
          password,
        })
          .then((success) =>
            res.status(201).json({
              status: 1,
              message: "New user successfully created.",
            })
          )
          .catch((error) =>
            res.status(300).json({
              status: 0,
              message: "Could not create new User.",
              error,
            })
          );
      }
    })
    .catch((error) =>
      res.status(300).json({
        status: 0,
        message: "Could not check for existing use.",
        error,
      })
    );
});

// default route
app.get("/", (req, res) => {
  res.status(200).json({
    status: 1,
    message: "Welcome to home page",
  });
});

app.listen(PORT, () => {
  console.log(`App listening to localhost:${PORT}`);
});
