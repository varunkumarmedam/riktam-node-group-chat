const dotenv = require("dotenv").config();

var express = require("express");
var session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);

var app = express();
var bodyParser = require("body-parser");

const auth = require("./modules/auth");
const users = require("./modules/users");
const groups = require("./modules/groups");
const message = require("./modules/message");

const Auth = require("./middleware/middleware");

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "group-chat-qwerty",
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
    store: new MongoDBStore({
      uri: process.env.MAIN_CLUSTER,
      databaseName: "group-chat",
      collection: "sessions",
    }),
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/auth", auth);
app.use("/user", users);
app.use("/group", groups);
app.use("/message", message);

app.listen(3000, () => {
  console.log("application started at 3000 port");
});
